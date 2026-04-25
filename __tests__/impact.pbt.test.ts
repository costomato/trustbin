/**
 * Property-based tests for impact delta computation
 * Feature: trustbin, Property 8: Trash disposals earn no impact score
 * Validates: Requirement 10.4
 */
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { computeImpactDelta } from '../lib/impact';

const materialTypeArb = fc.option(
  fc.constantFrom('aluminum_can', 'plastic_bottle', 'cardboard', 'food_waste', 'glass_bottle', 'paper', 'electronics', 'unknown_material'),
  { nil: null }
);

describe('Feature: trustbin, Property 8: Trash disposals earn no impact score', () => {
  it('computeImpactDelta always returns 0 for Trash classification', () => {
    fc.assert(
      fc.property(materialTypeArb, (materialType) => {
        return computeImpactDelta('Trash', materialType) === 0;
      }),
      { numRuns: 100 }
    );
  });

  it('computeImpactDelta returns >= 0 for all classifications', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Trash', 'Recycling', 'Compost'),
        materialTypeArb,
        (classification, materialType) => {
          return computeImpactDelta(classification, materialType) >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('computeImpactDelta returns > 0 for Recycling and Compost', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Recycling', 'Compost'),
        materialTypeArb,
        (classification, materialType) => {
          return computeImpactDelta(classification, materialType) > 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
