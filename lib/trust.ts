export interface UserProfile {
  trust_score: number;
  streak_weeks: number;
  flag_active: boolean;
  last_disposal_at: string | null;
}

export interface DisposalEventInput {
  is_correct: boolean;
  flagged: boolean;
}

/**
 * Returns the trust delta for a disposal event.
 * Req 4.2: +10 for correct disposal
 * Req 4.3: +2 streak bonus when streak_weeks >= 2
 * Req 4.8: flagged events → no change
 */
export function computeTrustDelta(profile: UserProfile, event: DisposalEventInput): number {
  // If event is flagged, no penalty (Req 4.8)
  if (event.flagged) return 0;
  // If user has active flag, no increment (Req 4.7)
  if (profile.flag_active) return 0;
  // Only correct disposals earn points
  if (!event.is_correct) return 0;
  // Base: 10 points + streak bonus
  const streakBonus = profile.streak_weeks >= 2 ? 2 : 0;
  return 10 + streakBonus;
}

/**
 * Returns the new trust score after applying decay.
 * Req 4.6: 5pts/day after 14 days inactive, floor 0
 */
export function computeDecay(
  currentTrustScore: number,
  lastDisposalAt: string | null,
  now: Date
): number {
  if (!lastDisposalAt || currentTrustScore <= 0) return currentTrustScore;
  const lastDisposal = new Date(lastDisposalAt);
  const daysInactive = Math.floor(
    (now.getTime() - lastDisposal.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysInactive <= 14) return currentTrustScore;
  const decayDays = daysInactive - 14;
  const decay = decayDays * 5;
  return Math.max(0, currentTrustScore - decay);
}
