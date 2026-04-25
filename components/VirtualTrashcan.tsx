'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatItemName } from '@/lib/format';
import ItemIcon from '@/components/ItemIcon';
import { groupByClassification } from '@/lib/trashcan';
import type { DisposalItem, Classification } from '@/lib/trashcan';

interface VirtualTrashcanProps {
  items: DisposalItem[];
}

const BIN_CONFIG: { 
  type: Classification; 
  label: string; 
  color: string; 
  borderColor: string;
  bgColor: string;
  lidColor: string;
}[] = [
  { 
    type: 'Trash', 
    label: 'Landfill', 
    color: 'text-gray-700',
    borderColor: 'border-gray-400',
    bgColor: 'bg-gray-100/80',
    lidColor: 'bg-gray-400'
  },
  { 
    type: 'Recycling', 
    label: 'Recycling', 
    color: 'text-blue-700',
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-100/80',
    lidColor: 'bg-blue-400'
  },
  { 
    type: 'Compost', 
    label: 'Compost', 
    color: 'text-green-700',
    borderColor: 'border-green-400',
    bgColor: 'bg-green-100/80',
    lidColor: 'bg-green-400'
  },
];

export default function VirtualTrashcan({ items }: VirtualTrashcanProps) {
  const [selectedBin, setSelectedBin] = useState<Classification | null>(null);
  const grouped = groupByClassification(items);

  // Main view - all three bins
  if (!selectedBin) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="grid grid-cols-3 gap-3">
          {BIN_CONFIG.map(({ type, label, color, borderColor, bgColor, lidColor }) => {
            const binItems = grouped[type];

            return (
              <button
                key={type}
                onClick={() => setSelectedBin(type)}
                className="flex flex-col items-center gap-2 hover:scale-105 transition-transform"
              >
                {/* Transparent bin container - like the reference image */}
                <div className="relative w-full aspect-[4/5] flex flex-col">
                  {/* Top opening/rim */}
                  <div className={`relative ${lidColor} h-[12%] rounded-t-xl flex items-center justify-center shadow-sm`}>
                    {/* Opening slot */}
                    <div className="w-[60%] h-[40%] bg-black/30 rounded-sm" />
                  </div>
                  
                  {/* Transparent bin body showing items inside */}
                  <div className={`relative ${bgColor} ${borderColor} border-4 flex-1 rounded-b-xl shadow-lg overflow-hidden backdrop-blur-sm`}>
                    {/* Items visible inside - stacked naturally like fruits in a basket */}
                    <div className="absolute inset-0 flex flex-wrap gap-0.5 p-1.5 content-end justify-center items-end">
                      {binItems.slice(0, 8).map((item, idx) => {
                        // Create varied positioning for natural stacking
                        const row = Math.floor(idx / 3);
                        const col = idx % 3;
                        const rotation = (col === 0 ? -10 : col === 1 ? 5 : -5) + (row * 3);
                        
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ y: -30, opacity: 0, scale: 0.5 }}
                            animate={{ 
                              y: 0, 
                              opacity: 1, 
                              scale: 1,
                              rotate: rotation
                            }}
                            transition={{ 
                              delay: idx * 0.06, 
                              type: 'spring', 
                              stiffness: 200,
                              damping: 10
                            }}
                            className="w-7 h-7"
                            style={{
                              zIndex: binItems.length - idx
                            }}
                          >
                            <ItemIcon item={item} />
                          </motion.div>
                        );
                      })}
                      {binItems.length > 8 && (
                        <div className="w-7 h-7 flex items-center justify-center text-[9px] font-bold text-white bg-black/70 rounded-full shadow-md">
                          +{binItems.length - 8}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div className="text-center">
                  <p className={`text-sm font-semibold ${color}`}>{label}</p>
                  <p className="text-xs text-gray-500">{binItems.length} items</p>
                </div>
              </button>
            );
          })}
        </div>
        
        <p className="text-center text-sm text-gray-500">
          Tap a bin to view all contents
        </p>
      </div>
    );
  }

  // Detail view - single bin expanded
  const config = BIN_CONFIG.find(b => b.type === selectedBin)!;
  const binItems = grouped[selectedBin];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Back button */}
      <button
        onClick={() => setSelectedBin(null)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to all bins
      </button>

      {/* Large transparent bin visual */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-80 aspect-[4/5] flex flex-col">
          {/* Top opening/rim */}
          <div className={`relative ${config.lidColor} h-[12%] rounded-t-2xl flex items-center justify-center shadow-md`}>
            {/* Opening slot */}
            <div className="w-[60%] h-[45%] bg-black/40 rounded-md shadow-inner" />
          </div>
          
          {/* Large transparent bin body showing all items */}
          <div className={`relative ${config.bgColor} ${config.borderColor} border-[6px] flex-1 rounded-b-2xl shadow-2xl overflow-hidden backdrop-blur-sm`}>
            {/* Items stacked naturally inside - like the reference image */}
            <div className="absolute inset-0 flex flex-wrap gap-1 p-3 content-end justify-center items-end">
              {binItems.slice(0, 24).map((item, idx) => {
                // Create natural stacking pattern
                const row = Math.floor(idx / 4);
                const col = idx % 4;
                const rotation = (col === 0 ? -12 : col === 1 ? 8 : col === 2 ? -5 : 10) + (row * 2);
                const scale = 1 - (row * 0.05); // Items at bottom slightly larger
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ y: -50, opacity: 0, scale: 0.3, rotate: -30 }}
                    animate={{ 
                      y: 0, 
                      opacity: 1, 
                      scale: scale,
                      rotate: rotation
                    }}
                    transition={{ 
                      delay: idx * 0.03, 
                      type: 'spring', 
                      stiffness: 180,
                      damping: 12
                    }}
                    className="w-12 h-12"
                    style={{
                      zIndex: binItems.length - idx
                    }}
                  >
                    <ItemIcon item={item} />
                  </motion.div>
                );
              })}
              {binItems.length > 24 && (
                <div className="w-12 h-12 flex items-center justify-center text-xs font-bold text-white bg-black/80 rounded-full shadow-lg">
                  +{binItems.length - 24}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className={`text-2xl font-bold ${config.color}`}>{config.label}</h2>
          <p className="text-sm text-gray-500">{binItems.length} items</p>
        </div>
      </div>

      {/* Items list */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">All Items</h3>
        {binItems.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No items yet</p>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <AnimatePresence>
              {binItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-lg p-2 border border-gray-200">
                    <ItemIcon item={item} />
                  </div>
                  <p className="text-xs text-gray-600 text-center line-clamp-2 w-full">
                    {formatItemName(item.item_description)}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
