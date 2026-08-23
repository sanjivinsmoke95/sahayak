'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUiStore } from '@/store';

/** Shown once per session while the first data request settles. */
export function Splash() {
  const splashDone = useUiStore((s) => s.splashDone);
  const setSplashDone = useUiStore((s) => s.setSplashDone);

  useEffect(() => {
    if (splashDone) return;
    const id = setTimeout(() => setSplashDone(true), 1150);
    return () => clearTimeout(id);
  }, [splashDone, setSplashDone]);

  return (
    <AnimatePresence>
      {!splashDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.38, ease: 'easeIn' }}
          className="absolute inset-0 z-[70] flex flex-col items-center justify-center gap-5 bg-navy-600"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.4, 0.64, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <span className="grid h-24 w-24 place-items-center rounded-[28px] bg-white text-navy-600 shadow-lift">
              <svg
                viewBox="0 0 24 24"
                className="h-14 w-14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 1-.5z" />
                <path d="M9 13l2.2 2.2L16 10.5" />
              </svg>
            </span>
            <span className="text-4xl font-bold tracking-tight text-white">SAHAYAK</span>
          </motion.div>
          <span className="text-lg text-navy-100">सहायक · సహాయక్</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
