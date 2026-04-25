'use client';

interface StreakDisplayProps {
  streakDays: number;
  todayCorrect: number;
}

export default function StreakDisplay({ streakDays, todayCorrect }: StreakDisplayProps) {
  const todayDone = todayCorrect >= 1;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="mb-2">
        {streakDays > 0 ? (
          <p className="text-2xl font-bold text-gray-800">
            🔥 {streakDays} day{streakDays !== 1 ? '' : ''} streak
          </p>
        ) : (
          <p className="text-base text-gray-500">Start your streak today!</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {todayDone ? (
          <span className="text-sm text-green-600 font-medium">✅ Today&apos;s disposal logged</span>
        ) : (
          <span className="text-sm text-gray-400">Log 1 correct disposal to keep your streak</span>
        )}
      </div>
    </div>
  );
}
