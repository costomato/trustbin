import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { computeDecay } from "@/lib/trust";
import { evaluateStreak } from "@/lib/streak";

export async function POST(req: NextRequest) {
  // Validate cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Fetch users with trust_score > 0 and inactive for > 14 days
  const { data: users, error } = await supabase
    .from("user_profiles")
    .select("id, trust_score, last_disposal_at")
    .gt("trust_score", 0)
    .lt("last_disposal_at", cutoff.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let processed = 0;

  for (const user of users ?? []) {
    const newScore = computeDecay(user.trust_score, user.last_disposal_at, now);
    if (newScore !== user.trust_score) {
      await supabase
        .from("user_profiles")
        .update({ trust_score: newScore })
        .eq("id", user.id);
      processed++;
    }
  }

  // Streak evaluation + new leaderboard period: runs on Mondays (start of new week)
  let streaksProcessed = 0;
  let newPeriodCreated = false;
  if (now.getUTCDay() === 1) {
    // Evaluate streaks
    const { data: allUsers, error: streakError } = await supabase
      .from("user_profiles")
      .select("id, streak_weeks, current_week_correct");

    if (!streakError) {
      for (const user of allUsers ?? []) {
        const { newStreak } = evaluateStreak(user.streak_weeks, user.current_week_correct);
        await supabase
          .from("user_profiles")
          .update({ streak_weeks: newStreak, current_week_correct: 0 })
          .eq("id", user.id);
        streaksProcessed++;
      }
    }

    // Create new leaderboard period for this week
    const weekStart = new Date(now);
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const label = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    const { error: periodError } = await supabase
      .from("leaderboard_periods")
      .insert({ period_label: label, starts_at: weekStart.toISOString(), ends_at: weekEnd.toISOString() });

    newPeriodCreated = !periodError;
  }

  return NextResponse.json({ processed, streaksProcessed, newPeriodCreated });
}
