'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface DropAnimationProps {
  show: boolean;
  classification: 'Trash' | 'Recycling' | 'Compost';
}

const EMOJI: Record<string, string> = {
  Trash: '🗑️',
  Recycling: '♻️',
  Compost: '🌱',
};

export default function DropAnimation({ show, classification }: DropAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="drop"
          initial={{ y: -60, opacity: 1, scale: 1 }}
          animate={{ y: 40, opacity: 0, scale: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeIn' }}
          className="absolute top-0 left-1/2 -translate-x-1/2 text-3xl pointer-events-none z-10"
        >
          {EMOJI[classification]}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
