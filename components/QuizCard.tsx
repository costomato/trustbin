'use client';

import { useState, useEffect } from 'react';
import { displayLabel } from '@/lib/display-labels';

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
    if (!selected) return 'bg-white border-2 border-gray-200 text-gray-800 hover:border-purple-300 hover:bg-purple-50';
    if (choice === question.correct_answer) return 'bg-green-100 border-2 border-green-500 text-green-800 font-semibold';
    if (choice === selected) return 'bg-red-100 border-2 border-red-400 text-red-700 font-semibold';
    return 'bg-gray-50 border-2 border-gray-200 text-gray-400';
  }

  const isCorrect = selected === question.correct_answer;

  return (
    <div className="flex flex-col gap-5 w-full rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg border-2 border-purple-100">
      {question.image_url && (
        <div className="rounded-2xl overflow-hidden shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.image_url}
            alt="Item to classify"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-base font-semibold text-gray-800">{question.question_text}</p>
      </div>

      <div className="flex flex-col gap-3">
        {question.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => handleSelect(choice)}
            disabled={!!selected}
            className={`w-full text-left px-5 py-4 rounded-xl text-sm font-medium transition-all disabled:cursor-default transform hover:scale-[1.02] active:scale-[0.98] ${getButtonStyle(choice)}`}
          >
            {displayLabel(choice)}
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className={`rounded-2xl px-5 py-4 text-sm ${isCorrect ? 'bg-green-100 border-2 border-green-300 text-green-800' : 'bg-orange-100 border-2 border-orange-300 text-orange-800'}`}>
            <div className="flex items-start gap-2">
              <span className="text-xl">{isCorrect ? '✓' : 'ℹ️'}</span>
              <div>
                <p className="font-semibold mb-1">{isCorrect ? 'Correct!' : 'Not quite!'}</p>
                <p className="text-sm">{question.explanation}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Next Question →
          </button>
        </>
      )}
    </div>
  );
}
