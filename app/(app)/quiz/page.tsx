import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import QuizPageClient from '@/components/QuizPageClient';

const DAILY_QUIZ_LIMIT = 3;

export default async function QuizPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  // Count how many questions the user answered today
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count: answeredToday } = await admin
    .from('quiz_questions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('answered', true)
    .gte('created_at', todayStart.toISOString());

  const remaining = Math.max(0, DAILY_QUIZ_LIMIT - (answeredToday ?? 0));

  if (remaining === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <span className="text-4xl mb-4">✅</span>
        <p className="text-gray-800 font-semibold text-lg">Daily quiz complete!</p>
        <p className="text-gray-500 mt-1">You&apos;ve answered {DAILY_QUIZ_LIMIT} questions today. Come back tomorrow!</p>
      </main>
    );
  }

  // Fetch unanswered questions, limited to remaining daily allowance
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, question_text, image_url, choices, correct_answer, explanation')
    .eq('user_id', user.id)
    .eq('answered', false)
    .order('created_at', { ascending: true })
    .limit(remaining);

  if (!questions || questions.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <span className="text-4xl mb-4">📭</span>
        <p className="text-gray-500">No quiz questions yet. Scan some items first!</p>
        <p className="text-gray-400 text-sm mt-1">{remaining} of {DAILY_QUIZ_LIMIT} questions remaining today</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quiz</h1>
        <span className="text-sm text-gray-400">{remaining} left today</span>
      </div>
      <QuizPageClient questions={questions} />
    </main>
  );
}
