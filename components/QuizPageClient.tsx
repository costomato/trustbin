'use client';

import { useState } from 'react';
import QuizCard from '@/components/QuizCard';

interface QuizQuestion {
  id: string;
  question_text: string;
  image_url?: string | null;
  choices: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizPageClientProps {
  questions: QuizQuestion[];
}

export default function QuizPageClient({ questions }: QuizPageClientProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  async function handleAnswer(answer: string, isCorrect: boolean) {
    const question = questions[index];

    // Submit to API
    await fetch('/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: question.id, answer }),
    });

    if (isCorrect) setScore((s) => s + 1);

    // Advance after a short delay so user can read the explanation
    setTimeout(() => {
      if (index + 1 >= questions.length) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
      }
    }, 1800);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="text-5xl">🎉</span>
        <p className="text-2xl font-bold text-gray-800">Quiz complete!</p>
        <p className="text-gray-500">
          You got <span className="font-semibold text-indigo-600">{score}/{questions.length}</span> correct.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-sm text-gray-400 text-right">
        {index + 1} / {questions.length}
      </p>
      <QuizCard question={questions[index]} onAnswer={handleAnswer} />
    </div>
  );
}
