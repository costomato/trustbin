/**
 * Snapshot tests for VirtualTrashcan component rendering
 * Validates: Requirement 7.2, 7.3
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style }: React.HTMLAttributes<HTMLDivElement>) =>
      React.createElement('div', { className, style }, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

import VirtualTrashcan from '@/components/VirtualTrashcan';
import type { DisposalItem } from '@/lib/trashcan';

const ITEMS: DisposalItem[] = [
  { id: '1', ai_classification: 'Recycling', item_description: 'Aluminum can', material_type: 'aluminum_can', created_at: '2025-01-01T00:00:00Z', image_url: null },
  { id: '2', ai_classification: 'Compost',   item_description: 'Banana peel',  material_type: 'food_waste',   created_at: '2025-01-02T00:00:00Z', image_url: null },
  { id: '3', ai_classification: 'Trash',     item_description: 'Chip bag',     material_type: null,           created_at: '2025-01-03T00:00:00Z', image_url: null },
];

describe('VirtualTrashcan snapshots', () => {
  it('renders three bins with correct item counts', () => {
    const { container } = render(React.createElement(VirtualTrashcan, { items: ITEMS }));
    expect(container).toMatchSnapshot();
  });

  it('renders empty state with no items', () => {
    const { container } = render(React.createElement(VirtualTrashcan, { items: [] }));
    expect(container).toMatchSnapshot();
  });

  it('renders multiple items in the same bin', () => {
    const multiItems: DisposalItem[] = [
      { id: 'a', ai_classification: 'Recycling', item_description: 'Bottle', material_type: 'plastic_bottle', created_at: '2025-01-01T00:00:00Z', image_url: null },
      { id: 'b', ai_classification: 'Recycling', item_description: 'Can',    material_type: 'aluminum_can',   created_at: '2025-01-02T00:00:00Z', image_url: null },
    ];
    const { container } = render(React.createElement(VirtualTrashcan, { items: multiItems }));
    expect(container).toMatchSnapshot();
  });
});
