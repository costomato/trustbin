/**
 * Property-based tests for leaderboard qualification filtering
 * Feature: trustbin, Property 5: Weekly minimum gates leaderboard qualification
 * Validates: Requirements 6.4, 6.5, 10.2
 */
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { isLeaderboardQualified, WEEKLY_MINIMUM } from '../lib/leaderboard';

describe(
  'Feature: trustbin, Property 5: Weekly minimum gates leaderboard qualification',
  () => {
    it('users with weeklyCorrect >= WEEKLY_MINIMUM are always qualified', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: WEEKLY_MINIMUM, max: 100 }),
          (weeklyCorrect) => isLeaderboardQualified(weeklyCorrect) === true
        ),
        { numRuns: 100 }
      );
    });

    it('users with weeklyCorrect < WEEKLY_MINIMUM are never qualified', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: WEEKLY_MINIMUM - 1 }),
          (weeklyCorrect) => isLeaderboardQualified(weeklyCorrect) === false
        ),
        { numRuns: 100 }
      );
    });

    it('qualification is monotone: if qualified at N, qualified at N+1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: WEEKLY_MINIMUM, max: 99 }),
          (n) => isLeaderboardQualified(n) === isLeaderboardQualified(n + 1) || isLeaderboardQualified(n + 1)
        ),
        { numRuns: 100 }
      );
    });
  }
);
