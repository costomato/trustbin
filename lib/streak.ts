/**
 * Daily streak system — Duolingo-style.
 * Streak increments each day the user logs at least 1 correct disposal.
 * Streak is preserved (not reset) on ASU holidays.
 */

// ASU holidays for 2025-2026 academic year (add more as needed)
export const ASU_HOLIDAYS: string[] = [
  '2025-09-01', // Labor Day
  '2025-11-11', // Veterans Day
  '2025-11-27', // Thanksgiving
  '2025-11-28', // Thanksgiving Friday
  '2025-12-25', // Christmas
  '2025-12-26', // Winter break
  '2026-01-01', // New Year's Day
  '2026-01-19', // MLK Day
  '2026-03-08', // Spring Break start
  '2026-03-09',
  '2026-03-10',
  '2026-03-11',
  '2026-03-12',
  '2026-03-13', // Spring Break end
  '2026-05-25', // Memorial Day
  '2026-07-04', // Independence Day
  '2026-09-07', // Labor Day
  '2026-11-26', // Thanksgiving
  '2026-11-27', // Thanksgiving Friday
  '2026-12-25', // Christmas
];

export function isASUHoliday(date: Date): boolean {
  const dateStr = date.toISOString().slice(0, 10);
  return ASU_HOLIDAYS.includes(dateStr);
}

/**
 * Evaluates the daily streak.
 * @param currentStreak - current streak in days
 * @param hadCorrectDisposalToday - whether the user logged at least 1 correct disposal today
 * @param isHoliday - whether today is an ASU holiday
 * @returns new streak value
 */
export function evaluateStreak(
  currentStreak: number,
  hadCorrectDisposalToday: boolean,
  isHoliday: boolean = false
): { newStreak: number; maintained: boolean } {
  if (hadCorrectDisposalToday) {
    return { newStreak: currentStreak + 1, maintained: true };
  }
  if (isHoliday) {
    // Preserve streak on holidays without requiring a disposal
    return { newStreak: currentStreak, maintained: true };
  }
  return { newStreak: 0, maintained: false };
}
