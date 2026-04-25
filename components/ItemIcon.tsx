'use client';

import { useState } from 'react';
import type { DisposalItem } from '@/lib/trashcan';

interface ItemIconProps {
  item: DisposalItem;
}

const TIPS: Record<string, string> = {
  aluminum_can: 'Rinse cans before recycling to avoid contamination.',
  plastic_bottle: 'Remove caps and rinse bottles before recycling.',
  cardboard: 'Flatten cardboard boxes to save space in the bin.',
  food_waste: 'Composting food waste reduces methane emissions from landfills.',
  electronics: 'Never put electronics in regular trash — use e-waste drop-offs.',
};

function getEducationalTip(materialType: string | null): string {
  if (!materialType) return 'Every correct disposal makes a difference!';
  return TIPS[materialType] ?? 'Proper disposal helps keep our campus clean and green.';
}

export default function ItemIcon({ item }: ItemIconProps) {
  const [open, setOpen] = useState(false);

  const emoji = item.ai_classification === 'Recycling' ? '♻️'
    : item.ai_classification === 'Compost' ? '🌱' : '🗑️';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-base hover:scale-110 transition-transform"
        title={item.item_description}
      >
        {emoji}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-gray-800 mb-1">{item.item_description}</p>
            <p className="text-sm text-gray-500 mb-3">
              {item.ai_classification} · {item.material_type ?? 'unknown material'} ·{' '}
              {new Date(item.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 bg-green-50 rounded-xl p-3">
              💡 {getEducationalTip(item.material_type)}
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
