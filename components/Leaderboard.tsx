'use client';

interface LeaderboardEntry {
  rank: number;
  display_name: string | null;
  email: string;
  score: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  periodLabel: string;
  currentUserId?: string;
}

export default function Leaderboard({ entries, periodLabel, currentUserId: _currentUserId }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No qualified users yet this period. Log 3 correct disposals to qualify!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-xs text-gray-400 text-center">{periodLabel}</p>
      {entries.map((entry) => (
        <div
          key={entry.rank}
          className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 px-4 py-3 shadow-sm"
        >
          <span className="text-lg font-bold text-gray-300 w-6 text-center">{entry.rank}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {entry.display_name ?? entry.email}
            </p>
          </div>
          <span className="text-sm font-semibold text-indigo-600">{entry.score} pts</span>
        </div>
      ))}
    </div>
  );
}
