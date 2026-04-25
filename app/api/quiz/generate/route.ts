import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { anthropic, ANTHROPIC_MODEL } from '@/lib/anthropic';
import { validateQuizQuestion } from '@/lib/quiz';

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { disposalEventId?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!body.disposalEventId) {
    return NextResponse.json({ error: 'disposalEventId required' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch disposal event (must belong to current user)
  const { data: event, error: eventError } = await admin
    .from('disposal_events')
    .select('*')
    .eq('id', body.disposalEventId)
    .eq('user_id', user.id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: 'Disposal event not found' }, { status: 404 });
  }

  const prompt = `Generate a quiz question about this waste item. Classification: ${event.ai_classification}, Material type: ${event.material_type ?? 'unknown'}, Description: ${event.item_description}. Respond with JSON only: { "question": "...", "choices": ["Trash", "Recycling", "Compost", "None of the above"], "correct_answer": "...", "explanation": "..." }`;

  let rawText: string;
  try {
    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });
    const block = response.content[0];
    if (block.type !== 'text') throw new Error('Unexpected response type');
    rawText = block.text;
  } catch (err) {
    console.error('Anthropic quiz generation error:', err);
    return NextResponse.json({ error: 'Quiz generation failed' }, { status: 500 });
  }

  // Parse and validate
  let parsed: unknown;
  try {
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    parsed = JSON.parse(jsonText);
  } catch {
    return NextResponse.json({ error: 'Failed to parse quiz response' }, { status: 500 });
  }

  if (!validateQuizQuestion(parsed)) {
    return NextResponse.json({ error: 'Invalid quiz question structure' }, { status: 500 });
  }

  // Store in quiz_questions
  const { data: question, error: insertError } = await admin
    .from('quiz_questions')
    .insert({
      user_id: user.id,
      disposal_event_id: event.id,
      question_text: parsed.question,
      image_url: event.image_url ?? null,
      choices: parsed.choices,
      correct_answer: parsed.correct_answer,
      explanation: parsed.explanation,
    })
    .select()
    .single();

  if (insertError || !question) {
    return NextResponse.json({ error: 'Failed to store quiz question' }, { status: 500 });
  }

  return NextResponse.json(question);
}
