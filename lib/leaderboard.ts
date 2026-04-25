export const WEEKLY_MINIMUM = 3;

/**
 * Returns true if the user qualifies for the leaderboard this period.
 * Property 5: weekly_correct >= WEEKLY_MINIMUM required.
 */
export function isLeaderboardQualified(weeklyCorrect: number): boolean {
  return weeklyCorrect >= WEEKLY_MINIMUM;
}
