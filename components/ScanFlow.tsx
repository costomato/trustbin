'use client';

import { useState } from 'react';
import CameraCapture from '@/components/CameraCapture';
import ClassificationResult from '@/components/ClassificationResult';
import BinSelector from '@/components/BinSelector';
import DisposalFeedback from '@/components/DisposalFeedback';
import { displayLabel } from '@/lib/display-labels';

type BinType = 'Trash' | 'Recycling' | 'Compost';
type ScanState = 'choose_mode' | 'camera' | 'classifying' | 'result' | 'bin_select' | 'feedback';

interface ClassifyResponse {
  classification: BinType;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
  material_type: string;
}

interface DisposalResponse {
  isCorrect: boolean;
  trustDelta: number;
  newTrustScore: number;
  disposalEventId: string;
}

interface ScanFlowProps {
  trustScore: number;
}

const TRUST_THRESHOLD = 100;

export default function ScanFlow({ trustScore }: ScanFlowProps) {
  const tapToLog = trustScore >= TRUST_THRESHOLD;
  const initialState: ScanState = tapToLog ? 'choose_mode' : 'camera';

  const [state, setState] = useState<ScanState>(initialState);
  const [useTapMode, setUseTapMode] = useState(false);
  const [itemDescription, setItemDescription] = useState('');
  const [classifyResult, setClassifyResult] = useState<ClassifyResponse | null>(null);
  const [disposalResult, setDisposalResult] = useState<DisposalResponse | null>(null);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  function reset() {
    setState(initialState);
    setUseTapMode(false);
    setItemDescription('');
    setClassifyResult(null);
    setDisposalResult(null);
    setClassifyError(null);
    setCapturedImage(null);
  }

  async function handleCapture(base64: string) {
    setState('classifying');
    setClassifyError(null);
    setCapturedImage(base64); // Store the captured image
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Classification failed');
      }
      const data: ClassifyResponse = await res.json();
      setClassifyResult(data);
      setState('result');
    } catch (err) {
      setClassifyError(err instanceof Error ? err.message : 'Could not classify the image. Please try again.');
      setState('camera');
    }
  }

  async function handleBinSelect(bin: BinType) {
    if (!classifyResult && !tapToLog) return;

    // For tap-to-log, we use the item description as the classification source.
    // We still need an aiClassification — use the selected bin as the classification
    // since there's no photo to classify (user is trusted).
    const aiClassification = tapToLog
      ? bin // trusted user: treat selected bin as correct
      : classifyResult!.classification;

    const res = await fetch('/api/disposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aiClassification,
        selectedBin: bin,
        itemDescription: itemDescription || classifyResult?.material_type || 'Unknown item',
        materialType: classifyResult?.material_type,
        imageData: capturedImage, // Pass the captured image
      }),
    });

    if (res.ok) {
      const data: DisposalResponse = await res.json();
      setDisposalResult(data);

      // Generate a quiz question from this disposal event (fire and forget)
      fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disposalEventId: data.disposalEventId }),
      }).catch(() => {}); // non-critical, don't block the flow
    }
    setState('feedback');
  }

  // ── Mode selection (trust >= 100) ──────────────────────────────────────
  if (tapToLog && state === 'choose_mode') {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium text-center">
          ✓ Tap-to-log unlocked!
        </div>
        <p className="text-center text-sm text-gray-500">How do you want to log this item?</p>
        <div className="flex gap-3">
          <button
            onClick={() => { setUseTapMode(true); setState('bin_select'); }}
            className="flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
          >
            <span className="text-2xl">⚡</span>
            <span>Tap to Log</span>
          </button>
          <button
            onClick={() => { setUseTapMode(false); setState('camera'); }}
            className="flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl bg-gray-700 hover:bg-gray-800 text-white font-semibold transition-colors"
          >
            <span className="text-2xl">📷</span>
            <span>Use Camera</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Tap-to-log mode ──────────────────────────────────────────────────────
  if (tapToLog && useTapMode) {
    if (state === 'bin_select') {
      return (
        <div className="flex flex-col gap-6 w-full">
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium text-center">
            ✓ Tap-to-log mode — no photo required
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="item-desc">
              What are you disposing?
            </label>
            <input
              id="item-desc"
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g. plastic bottle, banana peel, cardboard box"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <BinSelector onSelect={handleBinSelect} disabled={!itemDescription.trim()} />
        </div>
      );
    }

    if (state === 'feedback') {
      return (
        <DisposalFeedback
          isCorrect={disposalResult?.isCorrect ?? true}
          trustDelta={disposalResult?.trustDelta ?? 0}
          onContinue={reset}
        />
      );
    }
  }

  // ── Full scan flow (trust_score < 100) ───────────────────────────────────
  if (state === 'camera' || state === 'classifying') {
    return (
      <div className="flex flex-col gap-4 w-full">
        {classifyError && (
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-center">
            <p className="text-yellow-800 text-sm font-medium">⚠️ {classifyError}</p>
            <button
              onClick={() => setClassifyError(null)}
              className="mt-2 text-xs text-yellow-600 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
        {state === 'classifying' ? (
          <div className="flex items-center justify-center h-64 bg-gray-900 rounded-xl">
            <p className="text-gray-400 text-sm">Classifying…</p>
          </div>
        ) : (
          <CameraCapture onCapture={handleCapture} />
        )}
      </div>
    );
  }

  if (state === 'result' && classifyResult) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <ClassificationResult
          classification={classifyResult.classification}
          explanation={classifyResult.explanation}
          confidence={classifyResult.confidence}
          materialType={classifyResult.material_type}
          onRetake={() => setState('camera')}
          onManualSelect={(c) => {
            setClassifyResult({ ...classifyResult, classification: c });
            setState('bin_select');
          }}
        />
        {classifyResult.confidence !== 'low' && (
          <button
            onClick={() => setState('bin_select')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Select bin →
          </button>
        )}
      </div>
    );
  }

  if (state === 'bin_select' && classifyResult) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600 text-center">
          AI says: <span className="font-semibold">{displayLabel(classifyResult.classification)}</span>
        </div>
        <BinSelector onSelect={handleBinSelect} />
      </div>
    );
  }

  if (state === 'feedback') {
    return (
      <DisposalFeedback
        isCorrect={disposalResult?.isCorrect ?? false}
        trustDelta={disposalResult?.trustDelta ?? 0}
        onContinue={reset}
      />
    );
  }

  return null;
}
