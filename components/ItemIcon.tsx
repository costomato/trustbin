'use client';

import { useState } from 'react';
import { formatItemName } from '@/lib/format';
import { getItemFallbackImage } from '@/lib/item-images';
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

// Fallback emoji icons for items without images (last resort)
function getItemEmoji(description: string, materialType: string | null): string {
  const desc = description.toLowerCase();
  const mat = materialType?.toLowerCase() || '';
  
  // Bottles and containers
  if (desc.includes('bottle') || desc.includes('water bottle')) return '🍾';
  if (desc.includes('can') || desc.includes('soda') || desc.includes('coke')) return '🥫';
  if (desc.includes('cup') || desc.includes('coffee')) return '🥤';
  if (desc.includes('jar')) return '🫙';
  
  // Food waste
  if (desc.includes('banana') || desc.includes('peel')) return '🍌';
  if (desc.includes('apple')) return '🍎';
  if (desc.includes('orange')) return '🍊';
  if (desc.includes('food') || mat.includes('food')) return '🍽️';
  
  // Paper products
  if (desc.includes('paper') || desc.includes('cardboard') || desc.includes('box')) return '📄';
  if (desc.includes('newspaper')) return '📰';
  
  // Plastic
  if (desc.includes('plastic') || desc.includes('bag')) return '🛍️';
  
  // Glass
  if (desc.includes('glass')) return '🍷';
  
  // Electronics
  if (desc.includes('battery') || desc.includes('electronic')) return '🔋';
  
  // Default by classification
  return '♻️';
}

function getEducationalTip(materialType: string | null): string {
  if (!materialType) return 'Every correct disposal makes a difference!';
  return TIPS[materialType] ?? 'Proper disposal helps keep our campus clean and green.';
}

export default function ItemIcon({ item }: ItemIconProps) {
  const [open, setOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fallbackImageError, setFallbackImageError] = useState(false);

  const emoji = getItemEmoji(item.item_description, item.material_type);
  const fallbackImage = getItemFallbackImage(item.item_description, item.material_type);
  
  // Determine what to display
  const hasActualImage = item.image_url && !imageError;
  const hasFallbackImage = !hasActualImage && fallbackImage && !fallbackImageError;
  const displayImage = hasActualImage ? item.image_url : (hasFallbackImage ? fallbackImage : null);
  
  // Format the display name
  const displayName = formatItemName(item.item_description);
  const materialTypeName = formatItemName(item.material_type);

  const classificationLabel = item.ai_classification === 'Trash' ? 'Landfill' : item.ai_classification;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setOpen(true); } }}
        className="w-full h-full rounded-lg overflow-hidden hover:scale-110 transition-transform shadow-sm bg-white cursor-pointer"
        title={displayName}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={() => {
              if (hasActualImage) {
                setImageError(true);
              } else {
                setFallbackImageError(true);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-white to-gray-50">
            {emoji}
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Show image if available */}
            {displayImage && (
              <div className="mb-4 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={displayImage}
                  alt={displayName}
                  className="w-full h-64 object-contain"
                  onError={() => {
                    if (hasActualImage) {
                      setImageError(true);
                    } else {
                      setFallbackImageError(true);
                    }
                  }}
                />
              </div>
            )}
            
            <p className="text-lg font-bold text-gray-800 mb-1">{displayName}</p>
            <p className="text-sm text-gray-500 mb-3">
              {classificationLabel} · {materialTypeName} ·{' '}
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
