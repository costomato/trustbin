'use client';

import { getContextualTip } from '@/lib/education';

interface LoadingTipProps {
  materialType?: string | null;
}

export default function LoadingTip({ materialType }: LoadingTipProps) {
  const tip = getContextualTip(materialType);

  return (
    <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
      <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 max-w-xs">
        <span className="font-semibold text-green-600">💡 Did you know?</span>{' '}
        {tip}
      </p>
    </div>
  );
}
