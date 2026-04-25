export interface QuizQuestion {
  question: string;
  choices: string[];
  correct_answer: string;
  explanation: string;
}

export function validateQuizQuestion(q: unknown): q is QuizQuestion {
  if (!q || typeof q !== 'object') return false;
  const obj = q as Record<string, unknown>;
  return (
    typeof obj.question === 'string' && obj.question.trim().length > 0 &&
    Array.isArray(obj.choices) && obj.choices.length === 4 &&
    obj.choices.every((c) => typeof c === 'string') &&
    typeof obj.correct_answer === 'string' &&
    (obj.choices as string[]).includes(obj.correct_answer) &&
    typeof obj.explanation === 'string' && obj.explanation.trim().length > 0
  );
}
