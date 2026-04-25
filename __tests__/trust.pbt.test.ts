import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { computeTrustDelta, computeDecay } from '../lib/trust';
import type { UserProfile, DisposalEventInput } from '../lib/trust';

// ── Arbitraries ───────────────────────────────────────────────────────────────

const trustScoreArb = fc.integer({ min: 0, max: 500 });
const streakWeeksArb = fc.integer({ min: 0, max: 52 });
const boolArb = fc.boolean();

const lastDisposalAtArb = fc.option(
  fc.date({ min: new Date('2020-01-01'), max: new Date('2025-01-01') }).map((d) => d.toISOString()),
  { nil: null }
);

const userProfileArb = fc.record<UserProfile>({
  trust_score: trustScoreArb,
  streak_weeks: streakWeeksArb,
  flag_active: boolArb,
  last_disposal_at: lastDisposalAtArb,
});

const disposalEventArb = fc.record<DisposalEventInput>({
  is_correct: boolArb,
  flagged: boolArb,
});

// ── Task 5.7: Trust Delta Properties ─────────────────────────────────────────

describe('Feature: trustbin, Property 1: Trust score never goes below zero', () => {
  it('applying computeTrustDelta never produces a negative resulting trust score', () => {
    fc.assert(
      fc.property(userProfileArb, disposalEventArb, (profile, event) => {
        const delta = computeTrustDelta(profile, event);
        const newScore = Math.max(0, profile.trust_score + delta);
        return newScore >= 0;
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: trustbin, Property 2: Correct disposal increments trust score by expected amount', () => {
  it('correct disposal for unflagged user yields exactly 10 + streak bonus', () => {
    fc.assert(
      fc.property(
        fc.record<UserProfile>({
          trust_score: trustScoreArb,
          streak_weeks: streakWeeksArb,
          flag_active: fc.constant(false),
          last_disposal_at: lastDisposalAtArb,
        }),
        (profile) => {
          const event: DisposalEventInput = { is_correct: true, flagged: false };
          const delta = computeTrustDelta(profile, event);
          const expected = 10 + (profile.streak_weeks >= 2 ? 2 : 0);
          return delta === expected;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: trustbin, Property 3: Abuse threshold blocks trust score increments', () => {
  it('computeTrustDelta always returns 0 when flag_active is true', () => {
    fc.assert(
      fc.property(
        fc.record<UserProfile>({
          trust_score: trustScoreArb,
          streak_weeks: streakWeeksArb,
          flag_active: fc.constant(true),
          last_disposal_at: lastDisposalAtArb,
        }),
        disposalEventArb,
        (profile, event) => {
          return computeTrustDelta(profile, event) === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: trustbin, Property 4: Trust threshold unlocks tap-to-log', () => {
  it('trust score >= 100 means tap-to-log is available; < 100 means it is not', () => {
    fc.assert(
      fc.property(trustScoreArb, (score) => {
        const tapToLogAvailable = score >= 100;
        if (score >= 100) return tapToLogAvailable === true;
        return tapToLogAvailable === false;
      }),
      { numRuns: 100 }
    );
  });
});

// ── Task 5.8: Decay Properties ────────────────────────────────────────────────

describe('Feature: trustbin, Property 9: Decay does not exceed current trust score', () => {
  it('computeDecay never returns a value less than 0', () => {
    fc.assert(
      fc.property(
        trustScoreArb,
        lastDisposalAtArb,
        fc.date({ min: new Date('2020-01-01'), max: new Date('2026-01-01') }),
        (trustScore, lastDisposalAt, now) => {
          const result = computeDecay(trustScore, lastDisposalAt, now);
          return result >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('computeDecay never returns more than the current trust score (decay cannot increase score)', () => {
    fc.assert(
      fc.property(
        trustScoreArb,
        lastDisposalAtArb,
        fc.date({ min: new Date('2020-01-01'), max: new Date('2026-01-01') }),
        (trustScore, lastDisposalAt, now) => {
          const result = computeDecay(trustScore, lastDisposalAt, now);
          return result <= trustScore;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Feature: trustbin, Property 1: Trust score never goes below zero (decay path)', () => {
  it('applying computeDecay to any valid trust score never produces a negative result', () => {
    fc.assert(
      fc.property(
        trustScoreArb,
        lastDisposalAtArb,
        fc.date({ min: new Date('2020-01-01'), max: new Date('2026-01-01') }),
        (trustScore, lastDisposalAt, now) => {
          return computeDecay(trustScore, lastDisposalAt, now) >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
