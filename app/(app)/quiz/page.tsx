export const dynamic = 'force-dynamic';

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

  // Get total disposal count to show helpful message
  const { count: disposalCount } = await supabase
    .from('disposal_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (!questions || questions.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center max-w-md mx-auto">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-700 mb-2">No Quiz Questions Yet</h2>
        <p className="text-gray-500 mb-4">
          {disposalCount === 0 
            ? "Scan and correctly dispose items to generate quiz questions!"
            : "Keep scanning items! Quiz questions are generated when you make correct disposals."}
        </p>
        <p className="text-gray-400 text-sm mb-4">{remaining} of {DAILY_QUIZ_LIMIT} questions remaining today</p>
        <a 
          href="/scan" 
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Start Scanning
        </a>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-4 max-w-md mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quiz</h1>
          <p className="text-sm text-gray-600">Test your waste sorting knowledge</p>
        </div>
        <span className="text-sm text-gray-400">{remaining} left today</span>
      </div>
      <QuizPageClient questions={questions} />
    </main>
  );
}
