'use client';

import { Suspense } from 'react';
import { MeeSevaFinder } from '@/components/meeseva';

export default function MeeSevaPage() {
  return (
    <Suspense fallback={null}>
      <MeeSevaFinder />
    </Suspense>
  );
}
