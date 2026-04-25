export const WEEKLY_MINIMUM = 3;

export function evaluateStreak(
  currentStreak: number,
  weeklyCorrect: number
): { newStreak: number; maintained: boolean } {
  if (weeklyCorrect >= WEEKLY_MINIMUM) {
    return { newStreak: currentStreak + 1, maintained: true };
  }
  return { newStreak: 0, maintained: false };
}
