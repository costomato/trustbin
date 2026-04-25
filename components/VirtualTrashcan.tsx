'use client';

import { motion } from 'framer-motion';
import ItemIcon from '@/components/ItemIcon';
import { groupByClassification, computeFillLevel } from '@/lib/trashcan';
import type { DisposalItem, Classification } from '@/lib/trashcan';

interface VirtualTrashcanProps {
  items: DisposalItem[];
}

const BIN_CONFIG: { type: Classification; label: string; emoji: string; color: string; fill: string }[] = [
  { type: 'Trash',     label: 'Landfill',  emoji: '🗑️', color: 'border-gray-300 bg-gray-50',   fill: 'bg-gray-400' },
  { type: 'Recycling', label: 'Recycling', emoji: '♻️', color: 'border-blue-300 bg-blue-50',   fill: 'bg-blue-400' },
  { type: 'Compost',   label: 'Compost',   emoji: '🌱', color: 'border-green-300 bg-green-50', fill: 'bg-green-400' },
];

export default function VirtualTrashcan({ items }: VirtualTrashcanProps) {
  const grouped = groupByClassification(items);

  return (
    <div className="flex gap-3 w-full">
      {BIN_CONFIG.map(({ type, label, emoji, color, fill }) => {
        const binItems = grouped[type];
        const fillPct = computeFillLevel(binItems.length);

        return (
          <div key={type} className={`flex-1 flex flex-col rounded-2xl border-2 ${color} overflow-hidden`}>
            {/* Bin header */}
            <div className="flex items-center justify-center gap-1 py-2 text-sm font-semibold text-gray-700">
              <span>{emoji}</span>
              <span>{label}</span>
            </div>

            {/* Fill level bar */}
            <div className="relative h-2 bg-gray-200 mx-3 rounded-full overflow-hidden mb-2">
              <motion.div
                className={`h-full rounded-full ${fill}`}
                initial={{ width: 0 }}
                animate={{ width: `${fillPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* Item icons */}
            <div className="flex flex-wrap gap-1 p-2 min-h-[60px] content-start">
              {binItems.map((item) => (
                <ItemIcon key={item.id} item={item} />
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 pb-2">{binItems.length} item{binItems.length !== 1 ? 's' : ''}</p>
          </div>
        );
      })}
    </div>
  );
}
