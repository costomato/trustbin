'use client';

import { getImpactEquivalency, INDUSTRIAL_CONTEXT } from '@/lib/impact';

interface ImpactCardProps {
  impactScore: number;
}

export default function ImpactCard({ impactScore }: ImpactCardProps) {
  return (
    <div className="rounded-2xl bg-green-50 border border-green-200 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌍</span>
        <div>
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Your Impact</p>
          <p className="text-2xl font-bold text-green-800">{impactScore.toFixed(1)}</p>
        </div>
      </div>

      <p className="text-sm text-green-700">{getImpactEquivalency(impactScore)}</p>

      {/* Industrial context (Req 8.3) */}
      <p className="text-xs text-green-600 border-t border-green-200 pt-3 leading-relaxed">
        {INDUSTRIAL_CONTEXT}
      </p>
    </div>
  );
}
