/**
 * Property-based tests for flag suspension of trust score penalization
 * Feature: trustbin, Property 10: Flag suspends trust score penalization
 * Validates: Requirements 4.8, 2.4
 */
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { computeTrustDelta } from '../lib/trust';
import type { UserProfile } from '../lib/trust';

const profileArb = fc.record<UserProfile>({
  trust_score: fc.integer({ min: 0, max: 500 }),
  streak_weeks: fc.integer({ min: 0, max: 52 }),
  flag_active: fc.boolean(),
  last_disposal_at: fc.option(
    fc.date({ min: new Date('2020-01-01'), max: new Date('2025-01-01') }).map((d) => d.toISOString()),
    { nil: null }
  ),
});

describe(
  'Feature: trustbin, Property 10: Flag suspends trust score penalization',
  () => {
    it('flagged disposal events always return trust delta of 0', () => {
      fc.assert(
        fc.property(profileArb, fc.boolean(), (profile, isCorrect) => {
          // When event is flagged, delta must be 0 regardless of correctness or profile state
          return computeTrustDelta(profile, { is_correct: isCorrect, flagged: true }) === 0;
        }),
        { numRuns: 100 }
      );
    });

    it('trust score never decreases from a flagged event', () => {
      fc.assert(
        fc.property(profileArb, fc.boolean(), (profile, isCorrect) => {
          const delta = computeTrustDelta(profile, { is_correct: isCorrect, flagged: true });
          const newScore = Math.max(0, profile.trust_score + delta);
          return newScore >= profile.trust_score;
        }),
        { numRuns: 100 }
      );
    });
  }
);
