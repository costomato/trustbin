'use client';

import { motion } from 'framer-motion';

interface DisposalFeedbackProps {
  isCorrect: boolean;
  trustDelta: number;
  onContinue: () => void;
}

export default function DisposalFeedback({ isCorrect, trustDelta, onContinue }: DisposalFeedbackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-lg text-center"
    >
      <span className="text-5xl">{isCorrect ? '✅' : '❌'}</span>
      <p className={`text-2xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
        {isCorrect ? 'Correct!' : 'Incorrect'}
      </p>
      <p className="text-gray-500 text-sm">
        +{trustDelta} trust {trustDelta === 1 ? 'point' : 'points'}
      </p>
      <button
        onClick={onContinue}
        className="mt-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
      >
        Continue
      </button>
    </motion.div>
  );
}
