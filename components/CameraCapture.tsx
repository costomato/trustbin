'use client';

import { useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
}

type CameraState = 'loading' | 'ready' | 'error';

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>('loading');

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await Promise.race([
          navigator.mediaDevices.getUserMedia({ video: true }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Camera timeout')), 5000)
          ),
        ]);

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          setState('error');
          return;
        }

        video.srcObject = stream;
        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          setTimeout(() => reject(new Error('Metadata timeout')), 5000);
        });
        await video.play();
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
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.8));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Video is ALWAYS rendered so the ref is available during useEffect */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full aspect-video object-cover ${state !== 'ready' ? 'hidden' : ''}`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Loading overlay */}
      {state === 'loading' && (
        <div className="flex items-center justify-center w-full aspect-video">
          <p className="text-gray-400 text-sm">Requesting camera access…</p>
        </div>
      )}

      {/* Error overlay */}
      {state === 'error' && (
        <div className="flex flex-col items-center justify-center w-full aspect-video gap-3">
          <p className="text-gray-300 font-medium">Camera not available</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white text-gray-900 font-semibold px-6 py-2 rounded-full shadow-lg hover:bg-gray-100"
          >
            📁 Upload Photo
          </button>
        </div>
      )}

      {/* Buttons when camera is ready */}
      {state === 'ready' && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
          <button
            onClick={handleCapture}
            className="bg-white text-gray-900 font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 active:scale-95 transition-transform"
          >
            Capture
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-800 text-white font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-gray-700"
          >
            📁
          </button>
        </div>
      )}
    </div>
  );
}
