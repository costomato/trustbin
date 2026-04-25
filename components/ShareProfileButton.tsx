'use client';

import { useState } from 'react';

interface ShareProfileButtonProps {
  displayName: string;
  leaderboardScore: number;
  leaderboardRank: number | null;
  streakDays: number;
  impactScore: number;
}

export default function ShareProfileButton({
  displayName,
  leaderboardScore,
  leaderboardRank,
  streakDays,
  impactScore,
}: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false);

  function buildShareText() {
    const lines = [
      `🌱 ${displayName} on Trustbin`,
      `🏆 Leaderboard: ${leaderboardScore} pts${leaderboardRank ? ` (#${leaderboardRank})` : ''}`,
      `🔥 Streak: ${streakDays} day${streakDays !== 1 ? 's' : ''}`,
      `🌍 Impact: ${impactScore.toFixed(1)}`,
      '',
      'Join me on Trustbin — gamified recycling for ASU! ♻️',
    ];
    return lines.join('\n');
  }

  async function handleShare() {
    const text = buildShareText();

    // Use Web Share API if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort: prompt
      window.prompt('Copy your profile:', text);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
    >
      {copied ? '✅ Copied!' : '📤 Share Profile'}
    </button>
  );
}
