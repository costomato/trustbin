import { describe, it, expect } from 'vitest';
import { computeIsCorrect } from '../lib/disposal';
import { findNearestResource, getResourceForClassification } from '../lib/resources';

// ── computeIsCorrect ──────────────────────────────────────────────────────────

describe('computeIsCorrect', () => {
  it('returns true when aiClassification === selectedBin (Trash)', () => {
    expect(computeIsCorrect('Trash', 'Trash')).toBe(true);
  });

  it('returns true when aiClassification === selectedBin (Recycling)', () => {
    expect(computeIsCorrect('Recycling', 'Recycling')).toBe(true);
  });

  it('returns true when aiClassification === selectedBin (Compost)', () => {
    expect(computeIsCorrect('Compost', 'Compost')).toBe(true);
  });

  it('returns false when aiClassification !== selectedBin (Trash vs Recycling)', () => {
    expect(computeIsCorrect('Trash', 'Recycling')).toBe(false);
  });

  it('returns false when aiClassification !== selectedBin (Recycling vs Compost)', () => {
    expect(computeIsCorrect('Recycling', 'Compost')).toBe(false);
  });

  it('returns false when aiClassification !== selectedBin (Compost vs Trash)', () => {
    expect(computeIsCorrect('Compost', 'Trash')).toBe(false);
  });
});

// ── getResourceForClassification ──────────────────────────────────────────────

describe('getResourceForClassification', () => {
  it('returns water_fountain for materialType containing "bottle"', () => {
    expect(getResourceForClassification('Recycling', 'plastic bottle')).toBe('water_fountain');
  });

  it('returns water_fountain for materialType containing "beverage"', () => {
    expect(getResourceForClassification('Recycling', 'beverage can')).toBe('water_fountain');
  });

  it('returns ewaste_dropoff for materialType containing "electronics"', () => {
    expect(getResourceForClassification('Trash', 'old electronics')).toBe('ewaste_dropoff');
  });

  it('returns ewaste_dropoff for materialType containing "phone"', () => {
    expect(getResourceForClassification('Trash', 'broken phone')).toBe('ewaste_dropoff');
  });

  it('returns null for unrelated material types (e.g. cardboard)', () => {
    expect(getResourceForClassification('Recycling', 'cardboard')).toBeNull();
  });
});

// ── findNearestResource ───────────────────────────────────────────────────────

describe('findNearestResource', () => {
  it('returns the closest water fountain to Hayden Library (lat=33.4183, lng=-111.9346)', () => {
    // wf-001 "Hayden Library Water Station" is at exactly these coordinates
    const result = findNearestResource('water_fountain', 33.4183, -111.9346);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('wf-001');
    expect(result!.type).toBe('water_fountain');
  });

  it('returns null when no resources of the requested type exist', () => {
    // Cast to the union type to simulate a type with no entries in the dataset.
    // The real dataset has no 'recycling_bin' type, so candidates will be empty.
    const result = findNearestResource(
      'recycling_bin' as 'water_fountain' | 'ewaste_dropoff',
      33.4183,
      -111.9346
    );
    expect(result).toBeNull();
  });
});
