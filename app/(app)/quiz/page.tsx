import { createClient } from '@/lib/supabase/server';
import QuizPageClient from '@/components/QuizPageClient';

export default async function QuizPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, question_text, image_url, choices, correct_answer, explanation')
    .eq('user_id', user.id)
    .eq('answered', false)
    .order('created_at', { ascending: true });

  if (!questions || questions.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <span className="text-4xl mb-4">📭</span>
        <p className="text-gray-500">No quiz questions yet. Scan some items first!</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Quiz</h1>
      <QuizPageClient questions={questions} />
    </main>
  );
}
