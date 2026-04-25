'use client';

import { useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
}

type CameraState = 'loading' | 'ready' | 'error';

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>('loading');

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(base64);
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-900 rounded-xl">
        <p className="text-gray-400 text-sm">Requesting camera access…</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center w-full h-64 bg-gray-900 rounded-xl gap-2">
        <p className="text-red-400 font-medium">Camera access denied</p>
        <p className="text-gray-500 text-sm text-center px-4">
          Please allow camera permission in your browser settings and reload the page.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black">
      {/* Live camera feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Hidden canvas used for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Capture button */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <button
          onClick={handleCapture}
          className="bg-white text-gray-900 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 active:scale-95 transition-transform"
        >
          Capture
        </button>
      </div>
    </div>
  );
}
