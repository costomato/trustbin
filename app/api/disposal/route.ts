import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeIsCorrect } from "@/lib/disposal";
import { computeTrustDelta } from "@/lib/trust";
import { isLeaderboardQualified } from "@/lib/leaderboard";
import { computeImpactDelta } from "@/lib/impact";

type BinType = "Trash" | "Recycling" | "Compost";

interface DisposalRequestBody {
  aiClassification: BinType;
  selectedBin: BinType;
  itemDescription: string;
  materialType?: string;
  imageUrl?: string;
}

const VALID_BIN_TYPES: BinType[] = ["Trash", "Recycling", "Compost"];

export async function POST(req: NextRequest) {
  // 1. Validate auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate request body
  let body: DisposalRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { aiClassification, selectedBin, itemDescription, materialType, imageUrl } = body;

  if (
    !aiClassification ||
    !selectedBin ||
    !itemDescription ||
    !VALID_BIN_TYPES.includes(aiClassification) ||
    !VALID_BIN_TYPES.includes(selectedBin)
  ) {
    return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const userId = user.id;

  try {
    // 3. Fetch user profile
    const { data: profile, error: profileError } = await admin
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Failed to fetch user profile:", profileError);
      return NextResponse.json({ error: "User profile not found" }, { status: 500 });
    }

    // 4. Abuse check: >20 identical classifications in 24hrs (Task 4.3)
    const { count: recentCount, error: countError } = await admin
      .from("disposal_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("ai_classification", aiClassification)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (countError) {
      console.error("Abuse check query failed:", countError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    if ((recentCount ?? 0) > 20) {
      // Flag the user
      await admin
        .from("user_profiles")
        .update({ flag_active: true })
        .eq("id", userId);

      // We need a placeholder disposal_event_id for the flag record.
      // Insert a minimal disposal event first so the flag has a valid reference,
      // or insert the flag without a disposal_event_id if the schema allows.
      // Per schema, flags.disposal_event_id is NOT NULL, so insert the event first.
      const { data: abuseEvent } = await admin
        .from("disposal_events")
        .insert({
          user_id: userId,
          item_description: itemDescription,
          material_type: materialType ?? null,
          ai_classification: aiClassification,
          selected_bin: selectedBin,
          is_correct: computeIsCorrect(aiClassification, selectedBin),
          image_url: imageUrl ?? null,
          trust_delta: 0,
        })
        .select("id")
        .single();

      if (abuseEvent?.id) {
        await admin.from("flags").insert({
          disposal_event_id: abuseEvent.id,
          user_id: userId,
          reason: "abuse_auto_detected",
          status: "pending",
        });
      }

      return NextResponse.json({ blocked: true, reason: "abuse_threshold" }, { status: 200 });
    }

    // 5. Compute is_correct
    const isCorrect = computeIsCorrect(aiClassification, selectedBin);

    // 6. Compute trust_delta
    const trustDelta = computeTrustDelta(profile, { is_correct: isCorrect, flagged: false });

    // 7. Compute new trust score (floor at 0)
    const newTrustScore = Math.max(0, profile.trust_score + trustDelta);

    // 8. Insert disposal event
    const { data: disposalEvent, error: insertError } = await admin
      .from("disposal_events")
      .insert({
        user_id: userId,
        item_description: itemDescription,
        material_type: materialType ?? null,
        ai_classification: aiClassification,
        selected_bin: selectedBin,
        is_correct: isCorrect,
        image_url: imageUrl ?? null,
        trust_delta: trustDelta,
      })
      .select("id")
      .single();

    if (insertError || !disposalEvent) {
      console.error("Failed to insert disposal event:", insertError);
      return NextResponse.json({ error: "Failed to record disposal event" }, { status: 500 });
    }

    // 9. Update user profile
    const newWeeklyCorrect = profile.current_week_correct + (isCorrect ? 1 : 0);
    const impactDelta = computeImpactDelta(aiClassification, materialType ?? null);
    const { error: updateError } = await admin
      .from("user_profiles")
      .update({
        trust_score: newTrustScore,
        last_disposal_at: new Date().toISOString(),
        current_week_correct: newWeeklyCorrect,
        impact_score: profile.impact_score + impactDelta,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update user profile:", updateError);
      return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 });
    }

    // 9b. Update leaderboard qualification if user now meets weekly minimum (Req 6.4, 8.2)
    // Only update if not flag_active (Req 10.5 / 8.4)
    if (!profile.flag_active && isLeaderboardQualified(newWeeklyCorrect)) {
      // Get current period
      const { data: period } = await admin
        .from("leaderboard_periods")
        .select("id")
        .order("starts_at", { ascending: false })
        .limit(1)
        .single();

      if (period) {
        await admin
          .from("leaderboard_entries")
          .upsert(
            { period_id: period.id, user_id: userId, qualified: true },
            { onConflict: "period_id,user_id", ignoreDuplicates: false }
          );
      }
    }

    // 10. Return result
    return NextResponse.json({
      isCorrect,
      trustDelta,
      newTrustScore,
      disposalEventId: disposalEvent.id,
    });
  } catch (err) {
    console.error("Disposal route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
