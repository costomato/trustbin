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
    // Update user_profiles.leaderboard_score
    const { data: profile } = await admin
      .from('user_profiles')
      .select('leaderboard_score, flag_active')
      .eq('id', user.id)
      .single();

    if (profile && !profile.flag_active) {
      await admin
        .from('user_profiles')
        .update({ leaderboard_score: profile.leaderboard_score + 5 })
        .eq('id', user.id);

      // Also update leaderboard_entries.score for the current period
      const { data: period } = await admin
        .from('leaderboard_periods')
        .select('id')
        .order('starts_at', { ascending: false })
        .limit(1)
        .single();

      if (period) {
        // Get current entry
        const { data: entry } = await admin
          .from('leaderboard_entries')
          .select('score')
          .eq('period_id', period.id)
          .eq('user_id', user.id)
          .single();

        if (entry) {
          await admin
            .from('leaderboard_entries')
            .update({ score: entry.score + 5 })
            .eq('period_id', period.id)
            .eq('user_id', user.id);
        } else {
          // Create entry if it doesn't exist yet
          await admin
            .from('leaderboard_entries')
            .insert({ period_id: period.id, user_id: user.id, score: 5, qualified: true });
        }
      }
    }
  }

  return NextResponse.json({ isCorrect, explanation: question.explanation });
}
