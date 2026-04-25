/**
 * Property-based tests for daily streak logic
 * Feature: trustbin, Property 6: Streak increments only when daily minimum is met
 * Validates: Requirements 5.2, 5.3, 5.4
 */
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { evaluateStreak } from '../lib/streak';

const streakArb = fc.integer({ min: 0, max: 365 });

describe(
  'Feature: trustbin, Property 6: Streak increments only when daily minimum is met',
  () => {
    it('streak increments by 1 when user had a correct disposal today', () => {
      fc.assert(
        fc.property(streakArb, fc.boolean(), (currentStreak, isHoliday) => {
          const { newStreak, maintained } = evaluateStreak(currentStreak, true, isHoliday);
          return newStreak === currentStreak + 1 && maintained === true;
        }),
        { numRuns: 100 }
      );
    });

    it('streak resets to 0 when no disposal and not a holiday', () => {
      fc.assert(
        fc.property(streakArb, (currentStreak) => {
          const { newStreak, maintained } = evaluateStreak(currentStreak, false, false);
          return newStreak === 0 && maintained === false;
        }),
        { numRuns: 100 }
      );
    });

    it('streak is preserved (unchanged) on holidays without disposal', () => {
      fc.assert(
        fc.property(streakArb, (currentStreak) => {
          const { newStreak, maintained } = evaluateStreak(currentStreak, false, true);
          return newStreak === currentStreak && maintained === true;
        }),
        { numRuns: 100 }
      );
    });
  }
);
