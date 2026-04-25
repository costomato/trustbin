import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { questionId?: string; answer?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!body.questionId || !body.answer) {
    return NextResponse.json({ error: 'questionId and answer required' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: question, error: qError } = await admin
    .from('quiz_questions')
    .select('*')
    .eq('id', body.questionId)
    .eq('user_id', user.id)
    .single();

  if (qError || !question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  if (question.answered) {
    return NextResponse.json({ error: 'Question already answered' }, { status: 409 });
  }

  const isCorrect = body.answer === question.correct_answer;

  // Mark as answered
  await admin
    .from('quiz_questions')
    .update({ answered: true, answered_correctly: isCorrect })
    .eq('id', body.questionId);

  // Increment leaderboard score by 5 if correct (Req 6.3)
  if (isCorrect) {
    const { data: profile } = await admin
      .from('user_profiles')
      .select('leaderboard_score')
      .eq('id', user.id)
      .single();

    if (profile) {
      await admin
        .from('user_profiles')
        .update({ leaderboard_score: profile.leaderboard_score + 5 })
        .eq('id', user.id);
    }
  }

  return NextResponse.json({ isCorrect, explanation: question.explanation });
}
