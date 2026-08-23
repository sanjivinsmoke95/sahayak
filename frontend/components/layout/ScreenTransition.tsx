'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUiStore } from '@/store';

/** Forward pushes in from the right, back slides out, tabs cross-fade. */
export function ScreenTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const direction = useUiStore((s) => s.direction);

  const offset = direction === 'push' ? 26 : direction === 'pop' ? -26 : 0;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: direction === 'tab' ? 0 : 0.4, x: offset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: direction === 'tab' ? 0.18 : 0.26, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}
