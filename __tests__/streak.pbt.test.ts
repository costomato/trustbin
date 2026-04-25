import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { evaluateStreak, WEEKLY_MINIMUM } from '../lib/streak';

// ── Arbitraries ───────────────────────────────────────────────────────────────

const streakArb = fc.integer({ min: 0, max: 52 });
const weeklyCorrectArb = fc.integer({ min: 0, max: 100 });

// ── Task 6.5: Property 6 ──────────────────────────────────────────────────────

/**
 * Validates: Requirements 5.2, 5.3
 */
describe(
  'Feature: trustbin, Property 6: Streak increments only when weekly minimum is met',
  () => {
    it('streak increments by 1 when weeklyCorrect >= WEEKLY_MINIMUM', () => {
      fc.assert(
        fc.property(
          streakArb,
          fc.integer({ min: WEEKLY_MINIMUM, max: 100 }),
          (currentStreak, weeklyCorrect) => {
            const { newStreak, maintained } = evaluateStreak(currentStreak, weeklyCorrect);
            return newStreak === currentStreak + 1 && maintained === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('streak resets to 0 when weeklyCorrect < WEEKLY_MINIMUM', () => {
      fc.assert(
        fc.property(
          streakArb,
          fc.integer({ min: 0, max: WEEKLY_MINIMUM - 1 }),
          (currentStreak, weeklyCorrect) => {
            const { newStreak, maintained } = evaluateStreak(currentStreak, weeklyCorrect);
            return newStreak === 0 && maintained === false;
          }
        ),
        { numRuns: 100 }
      );
    });
  }
);
