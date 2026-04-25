import { describe, it, expect } from 'vitest';
import { computeTrustDelta, computeDecay } from '../lib/trust';
import type { UserProfile, DisposalEventInput } from '../lib/trust';

// ── computeTrustDelta ─────────────────────────────────────────────────────────

const baseProfile: UserProfile = {
  trust_score: 50,
  streak_weeks: 0,
  flag_active: false,
  last_disposal_at: null,
};

describe('computeTrustDelta', () => {
  it('returns 10 for a correct disposal with no streak', () => {
    const event: DisposalEventInput = { is_correct: true, flagged: false };
    expect(computeTrustDelta(baseProfile, event)).toBe(10);
  });

  it('returns 12 for a correct disposal with streak >= 2 weeks (Req 4.3)', () => {
    const profile = { ...baseProfile, streak_weeks: 2 };
    const event: DisposalEventInput = { is_correct: true, flagged: false };
    expect(computeTrustDelta(profile, event)).toBe(12);
  });

  it('returns 12 for streak > 2 weeks', () => {
    const profile = { ...baseProfile, streak_weeks: 5 };
    const event: DisposalEventInput = { is_correct: true, flagged: false };
    expect(computeTrustDelta(profile, event)).toBe(12);
  });

  it('returns 10 for streak exactly 1 week (no bonus)', () => {
    const profile = { ...baseProfile, streak_weeks: 1 };
    const event: DisposalEventInput = { is_correct: true, flagged: false };
    expect(computeTrustDelta(profile, event)).toBe(10);
  });

  it('returns 0 for an incorrect disposal', () => {
    const event: DisposalEventInput = { is_correct: false, flagged: false };
    expect(computeTrustDelta(baseProfile, event)).toBe(0);
  });

  it('returns 0 when event is flagged (Req 4.8)', () => {
    const event: DisposalEventInput = { is_correct: true, flagged: true };
    expect(computeTrustDelta(baseProfile, event)).toBe(0);
  });

  it('returns 0 when user has active flag (Req 4.7)', () => {
    const profile = { ...baseProfile, flag_active: true };
    const event: DisposalEventInput = { is_correct: true, flagged: false };
    expect(computeTrustDelta(profile, event)).toBe(0);
  });

  it('returns 0 for flagged + incorrect disposal', () => {
    const event: DisposalEventInput = { is_correct: false, flagged: true };
    expect(computeTrustDelta(baseProfile, event)).toBe(0);
  });
});

// ── computeDecay ──────────────────────────────────────────────────────────────

describe('computeDecay', () => {
  const now = new Date('2025-01-30T00:00:00Z');

  it('returns unchanged score when last disposal is within 14 days', () => {
    const lastDisposalAt = '2025-01-20T00:00:00Z'; // 10 days ago
    expect(computeDecay(80, lastDisposalAt, now)).toBe(80);
  });

  it('returns unchanged score at exactly 14 days', () => {
    const lastDisposalAt = '2025-01-16T00:00:00Z'; // 14 days ago
    expect(computeDecay(80, lastDisposalAt, now)).toBe(80);
  });

  it('decays 5 points for 1 day beyond 14-day grace (15 days inactive)', () => {
    const lastDisposalAt = '2025-01-15T00:00:00Z'; // 15 days ago
    expect(computeDecay(80, lastDisposalAt, now)).toBe(75);
  });

  it('decays 10 points for 2 days beyond grace (16 days inactive)', () => {
    const lastDisposalAt = '2025-01-14T00:00:00Z'; // 16 days ago
    expect(computeDecay(80, lastDisposalAt, now)).toBe(70);
  });

  it('floors at 0 when decay exceeds current score (Req 4.6)', () => {
    const lastDisposalAt = '2025-01-01T00:00:00Z'; // 29 days ago → 15 decay days → 75pts decay
    expect(computeDecay(50, lastDisposalAt, now)).toBe(0);
  });

  it('returns current score unchanged when last_disposal_at is null', () => {
    expect(computeDecay(50, null, now)).toBe(50);
  });

  it('returns 0 unchanged when trust_score is already 0', () => {
    expect(computeDecay(0, '2025-01-01T00:00:00Z', now)).toBe(0);
  });
});
