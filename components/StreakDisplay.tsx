'use client';

interface StreakDisplayProps {
  streakWeeks: number;
  currentWeekCorrect: number;
  weeklyMinimum?: number;
}

export default function StreakDisplay({
  streakWeeks,
  currentWeekCorrect,
  weeklyMinimum = 3,
}: StreakDisplayProps) {
  const progress = Math.min(currentWeekCorrect, weeklyMinimum);
  const progressPercent = Math.round((progress / weeklyMinimum) * 100);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      {/* Streak count */}
      <div className="mb-3">
        {streakWeeks > 0 ? (
          <p className="text-2xl font-bold text-gray-800">
            🔥 {streakWeeks} week{streakWeeks !== 1 ? 's' : ''} streak
          </p>
        ) : (
          <p className="text-base text-gray-500">Start your streak this week!</p>
        )}
      </div>

      {/* Weekly progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>This week</span>
          <span>
            {currentWeekCorrect}/{weeklyMinimum} correct
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
