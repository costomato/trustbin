import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anthropic, ANTHROPIC_MODEL } from "@/lib/anthropic";

const CLASSIFICATION_PROMPT =
  'Classify this item as exactly one of: Trash, Recycling, or Compost. Respond with JSON only: { "classification": "Trash|Recycling|Compost", "explanation": "brief reason", "confidence": "high|medium|low", "material_type": "e.g. aluminum_can, plastic_bottle, cardboard, food_waste, electronics" }';

export async function POST(req: NextRequest) {
  // 1. Validate authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse request body
  let body: { image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.image) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  // 3. Detect media type and strip data URL prefix
  let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";
  let base64Data = body.image;

  const dataUrlMatch = body.image.match(/^data:(image\/[a-z]+);base64,/);
  if (dataUrlMatch) {
    mediaType = dataUrlMatch[1] as typeof mediaType;
    base64Data = body.image.slice(dataUrlMatch[0].length);
  }

  if (!base64Data || base64Data.length < 100) {
    return NextResponse.json({ error: "Image data is empty or too small" }, { status: 400 });
  }

  // 4. Call Anthropic vision API
  let rawText: string;
  try {
    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: CLASSIFICATION_PROMPT,
            },
          ],
        },
      ],
    });

    const block = response.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected response type from Anthropic");
    }
    rawText = block.text;
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "We couldn't classify this image right now. Please try again." }, { status: 500 });
  }

  // 5. Parse JSON response
  let classification: string;
  let explanation: string;
  let confidence: string;
  let material_type: string;
  try {
    // Strip markdown code fences if present
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(jsonText);
    classification = parsed.classification;
    explanation = parsed.explanation;
    confidence = parsed.confidence;
    material_type = parsed.material_type;

    if (!["Trash", "Recycling", "Compost"].includes(classification)) {
      throw new Error(`Invalid classification value: ${classification}`);
    }
  } catch (err) {
    console.error("Failed to parse Anthropic response:", rawText, err);
    return NextResponse.json({ error: "We couldn't understand the result. Please try again with a clearer photo." }, { status: 500 });
  }

  // 6. Return result
  return NextResponse.json({ classification, explanation, confidence, material_type });
}
