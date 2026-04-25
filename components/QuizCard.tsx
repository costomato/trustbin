'use client';

import { useState, useEffect } from 'react';

interface QuizCardQuestion {
  id: string;
  question_text: string;
  image_url?: string | null;
  choices: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizCardProps {
  question: QuizCardQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  onNext: () => void;
}

export default function QuizCard({ question, onAnswer, onNext }: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Reset selection when question changes
  useEffect(() => {
    setSelected(null);
  }, [question.id]);

  function handleSelect(choice: string) {
    if (selected) return;
    setSelected(choice);
    onAnswer(choice, choice === question.correct_answer);
  }

  function getButtonStyle(choice: string) {
    if (!selected) return 'border border-gray-300 text-gray-800 hover:bg-gray-50';
    if (choice === question.correct_answer) return 'bg-green-100 border border-green-500 text-green-800 font-semibold';
    if (choice === selected) return 'bg-red-100 border border-red-400 text-red-700';
    return 'border border-gray-200 text-gray-400';
  }

  return (
    <div className="flex flex-col gap-4 w-full rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      {question.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={question.image_url}
          alt="Item to classify"
          className="w-full max-h-48 object-cover rounded-xl"
        />
      )}

      <p className="text-base font-medium text-gray-800">{question.question_text}</p>

      <div className="flex flex-col gap-2">
        {question.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => handleSelect(choice)}
            disabled={!!selected}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors disabled:cursor-default ${getButtonStyle(choice)}`}
          >
            {choice}
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
            <span className="font-semibold text-gray-700">Explanation: </span>
            {question.explanation}
          </div>
          <button
            onClick={onNext}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Next →
          </button>
        </>
      )}
    </div>
  );
}
