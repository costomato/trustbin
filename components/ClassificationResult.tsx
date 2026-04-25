'use client';

import { useState } from 'react';
import { displayLabel } from '@/lib/display-labels';

type Classification = 'Trash' | 'Recycling' | 'Compost';

interface ClassificationResultProps {
  classification: Classification;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  materialType: string;
  disposalEventId?: string;
  onRetake: () => void;
  onManualSelect: (classification: Classification) => void;
  onFlag?: (reason: string) => void;
}

const BADGE_STYLES: Record<Classification, string> = {
  Compost: 'bg-green-100 text-green-800 border border-green-300',
  Recycling: 'bg-blue-100 text-blue-800 border border-blue-300',
  Trash: 'bg-gray-100 text-gray-700 border border-gray-300',
};

const MANUAL_BUTTONS: { label: Classification; displayText: string; style: string }[] = [
  { label: 'Trash', displayText: 'Landfill', style: 'border border-gray-300 text-gray-700 hover:bg-gray-100' },
  { label: 'Recycling', displayText: 'Recycling', style: 'border border-blue-300 text-blue-700 hover:bg-blue-50' },
  { label: 'Compost', displayText: 'Compost', style: 'border border-green-300 text-green-700 hover:bg-green-50' },
];

export default function ClassificationResult({
  classification,
  explanation,
  confidence,
  materialType,
  onRetake,
  onManualSelect,
  onFlag,
}: ClassificationResultProps) {
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  function handleSubmitFlag() {
    if (!flagReason.trim()) return;
    onFlag?.(flagReason.trim());
    setFlagSubmitted(true);
    setFlagOpen(false);
    setFlagReason('');
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Classification badge */}
      <div className="flex flex-col items-center gap-2 py-4">
        <span className={`text-2xl font-bold px-5 py-2 rounded-full ${BADGE_STYLES[classification]}`}>
          {displayLabel(classification)}
        </span>
        {materialType && (
          <span className="text-sm text-gray-500">{materialType}</span>
        )}
      </div>

      {/* Explanation */}
      <p className="text-gray-700 text-sm leading-relaxed">{explanation}</p>

      {/* Low-confidence warning */}
      {confidence === 'low' && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 flex flex-col gap-3">
          <p className="text-yellow-800 text-sm font-medium">
            We&apos;re not sure about this — retake the photo or select manually
          </p>
          <button
            onClick={onRetake}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Retake
          </button>
          <div className="flex gap-2">
            {MANUAL_BUTTONS.map(({ label, displayText, style }) => (
              <button
                key={label}
                onClick={() => onManualSelect(label)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${style}`}
              >
                {displayText}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flag section */}
      {onFlag && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setFlagOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <span>{flagSubmitted ? 'Flag submitted — thank you' : 'Flag as incorrect'}</span>
            {!flagSubmitted && (
              <svg
                className={`w-4 h-4 transition-transform ${flagOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {flagOpen && !flagSubmitted && (
            <div className="px-4 pb-4 flex flex-col gap-2 border-t border-gray-100">
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Describe why this classification seems incorrect…"
                rows={3}
                className="w-full mt-2 text-sm border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={handleSubmitFlag}
                disabled={!flagReason.trim()}
                className="self-end bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Submit flag
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
