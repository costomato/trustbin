'use client';

import { motion } from 'framer-motion';

interface TrustScoreBarProps {
  score: number;
  threshold?: number;
}

export default function TrustScoreBar({ score, threshold = 100 }: TrustScoreBarProps) {
  const unlocked = score >= threshold;
  const fillPercent = Math.min((score / threshold) * 100, 100);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-gray-600">Trust Score</span>
        {unlocked ? (
          <span className="text-green-600 font-semibold">Tap-to-log unlocked! ✓</span>
        ) : (
          <span className="text-gray-700">
            {score} / {threshold}
          </span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-3 w-full rounded-full bg-gray-200 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${unlocked ? 'bg-green-500' : 'bg-indigo-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {!unlocked && (
        <p className="text-xs text-gray-400">
          {threshold - score} more point{threshold - score !== 1 ? 's' : ''} to unlock tap-to-log
        </p>
      )}
    </div>
  );
}
