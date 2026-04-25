/**
 * Property-based tests for VirtualTrashcan logic
 * Feature: trustbin, Property 7.3: Item grouping by classification
 * Feature: trustbin, Property 7.6: Fill level monotonicity
 * Validates: Requirements 7.3, 7.6
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { groupByClassification, computeFillLevel } from '../lib/trashcan';
import type { DisposalItem, Classification } from '../lib/trashcan';

const CLASSIFICATIONS: Classification[] = ['Trash', 'Recycling', 'Compost'];

const itemArb = fc.record<DisposalItem>({
  id: fc.uuid(),
  ai_classification: fc.constantFrom(...CLASSIFICATIONS),
  item_description: fc.string({ minLength: 1 }),
  material_type: fc.option(fc.string(), { nil: null }),
  created_at: fc.date().map((d) => d.toISOString()),
  image_url: fc.option(fc.webUrl(), { nil: null }),
});

describe('Feature: trustbin, Property 7.3: Item grouping by classification', () => {
  it('every item appears in exactly its classification bucket', () => {
    fc.assert(
      fc.property(fc.array(itemArb, { maxLength: 50 }), (items) => {
        const grouped = groupByClassification(items);
        // Total items across all buckets equals input length
        const total = grouped.Trash.length + grouped.Recycling.length + grouped.Compost.length;
        if (total !== items.length) return false;
        // Each item is in the correct bucket
        for (const item of items) {
          if (!grouped[item.ai_classification].some((i) => i.id === item.id)) return false;
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('no item appears in more than one bucket', () => {
    fc.assert(
      fc.property(fc.array(itemArb, { maxLength: 50 }), (items) => {
        const grouped = groupByClassification(items);
        const allIds = [
          ...grouped.Trash.map((i) => i.id),
          ...grouped.Recycling.map((i) => i.id),
          ...grouped.Compost.map((i) => i.id),
        ];
        return new Set(allIds).size === allIds.length;
      }),
      { numRuns: 100 }
    );
  });
});

describe('Feature: trustbin, Property 7.6: Fill level monotonicity', () => {
  it('fill level is monotonically non-decreasing with item count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 50 }),
        fc.integer({ min: 0, max: 50 }),
        (a, b) => {
          const smaller = Math.min(a, b);
          const larger = Math.max(a, b);
          return computeFillLevel(smaller) <= computeFillLevel(larger);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('fill level is always between 0 and 100', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), (count) => {
        const fill = computeFillLevel(count);
        return fill >= 0 && fill <= 100;
      }),
      { numRuns: 100 }
    );
  });

  it('fill level is 0 for empty bin', () => {
    expect(computeFillLevel(0)).toBe(0);
  });
});
