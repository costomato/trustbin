/**
 * Impact score computation.
 * Property 8: Trash disposals earn no impact score (Req 10.4).
 */

export interface ImpactWeight {
  unit: string;
  weight: number;
}

export const IMPACT_WEIGHTS: Record<string, ImpactWeight> = {
  aluminum_can:    { unit: 'aluminum cans recycled',       weight: 1.0 },
  plastic_bottle:  { unit: 'plastic bottles recycled',     weight: 0.8 },
  cardboard:       { unit: 'lbs of cardboard diverted',    weight: 0.5 },
  food_waste:      { unit: 'lbs of compost diverted',      weight: 0.3 },
  glass_bottle:    { unit: 'glass bottles recycled',       weight: 0.9 },
  paper:           { unit: 'sheets of paper recycled',     weight: 0.2 },
  electronics:     { unit: 'electronics diverted',         weight: 2.0 },
  plastic_bag:     { unit: 'plastic bags diverted',        weight: 0.1 },
};

/**
 * Returns the impact delta for a disposal event.
 * Trash disposals always return 0 (Req 10.4).
 */
export function computeImpactDelta(
  classification: string,
  materialType: string | null | undefined
): number {
  // Property 8: Trash earns no impact score
  if (classification === 'Trash') return 0;
  if (!materialType) return 0.1; // default small credit for non-trash
  return IMPACT_WEIGHTS[materialType]?.weight ?? 0.1;
}

/**
 * Returns a human-readable equivalency string for a given impact score.
 */
export function getImpactEquivalency(impactScore: number): string {
  if (impactScore <= 0) return 'Start recycling to build your impact!';
  if (impactScore < 2)  return `You've diverted ${impactScore.toFixed(1)} lbs of waste from landfill.`;
  if (impactScore < 10) return `You've recycled the equivalent of ${Math.round(impactScore)} aluminum cans.`;
  if (impactScore < 50) return `Your impact equals saving ${(impactScore * 0.06).toFixed(1)} kWh of energy.`;
  return `You've diverted ${impactScore.toFixed(0)} lbs of waste — that's like planting ${Math.round(impactScore / 20)} trees!`;
}

export const INDUSTRIAL_CONTEXT =
  'For context: a single industrial facility generates thousands of tons of waste per year. ' +
  'Individual actions like yours collectively shift demand and signal to producers that sustainability matters.';
