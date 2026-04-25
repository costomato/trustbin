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
      <div className="text-center py-12 px-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl border-2 border-yellow-200">
        <div className="text-6xl mb-4">🏆</div>
        <p className="text-gray-600 font-medium mb-2">No qualified users yet!</p>
        <p className="text-sm text-gray-500">Log 3 correct disposals to qualify for the leaderboard</p>
      </div>
    );
  }

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg scale-105';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md';
    return 'bg-white text-gray-600';
  };

  const getCardStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-lg';
    if (rank === 2) return 'bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300 shadow-md';
    if (rank === 3) return 'bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 shadow-md';
    return 'bg-white border-2 border-gray-200 shadow-sm';
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Period Label */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-3 px-4 rounded-2xl shadow-md">
        <p className="text-sm font-semibold">{periodLabel}</p>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-2 ${getRankStyle(2)}`}>
              {getMedalEmoji(2)}
            </div>
            <div className="bg-gradient-to-br from-gray-300 to-gray-400 h-20 w-full rounded-t-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-2 ${getRankStyle(1)}`}>
              {getMedalEmoji(1)}
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 h-28 w-full rounded-t-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-2 ${getRankStyle(3)}`}>
              {getMedalEmoji(3)}
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-orange-500 h-16 w-full rounded-t-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">3</span>
            </div>
          </div>
        </div>
      )}

      {/* All Rankings */}
      <div className="flex flex-col gap-3">
        {entries.map((entry) => {
          const medal = getMedalEmoji(entry.rank);
          
          return (
            <div
              key={entry.rank}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-all hover:scale-[1.02] ${getCardStyle(entry.rank)}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${getRankStyle(entry.rank)}`}>
                {medal || entry.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {entry.display_name ?? entry.email}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-purple-600">{entry.score}</span>
                <span className="text-xs text-gray-500">pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
