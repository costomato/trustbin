'use client';

interface BinSelectorProps {
  onSelect: (binType: 'Trash' | 'Recycling' | 'Compost') => void;
  disabled?: boolean;
}

const BINS = [
  { type: 'Trash' as const, emoji: '🗑️', label: 'Trash', color: 'bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300' },
  { type: 'Recycling' as const, emoji: '♻️', label: 'Recycling', color: 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300' },
  { type: 'Compost' as const, emoji: '🌱', label: 'Compost', color: 'bg-green-500 hover:bg-green-600 disabled:bg-green-300' },
];

export default function BinSelector({ onSelect, disabled = false }: BinSelectorProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-center text-sm font-medium text-gray-600">Which bin did you use?</p>
      <div className="flex gap-3 justify-center">
        {BINS.map(({ type, emoji, label, color }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            disabled={disabled}
            className={`flex flex-col items-center justify-center gap-2 px-6 py-5 rounded-2xl text-white font-semibold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed ${color}`}
          >
            <span className="text-3xl">{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
