'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import { Suspense } from 'react';

function AnalyzingScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const docId = params.get('doc');
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d % 3) + 1), 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (docId) {
      const timer = setTimeout(() => {
        setDirection('push');
        router.replace(`/v2/documents/${docId}`);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [docId, router, setDirection]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="relative mx-auto mb-6 h-20 w-20">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#E1F0EF] border-t-[#0C6E6B]" />
        <div className="absolute inset-3 animate-[spin_1.5s_linear_infinite_reverse] rounded-full border-4 border-[#E1F0EF] border-t-[#C97B1A]" />
      </div>
      <h1 className="v2-heading text-xl font-bold text-[#19120E]">
        {t('analyzingTitle')}{'.'.repeat(dots)}
      </h1>
      <p className="mt-2 text-base text-[#7A6E68]">{t('analyzingSub')}</p>
    </div>
  );
}

export default function V2AnalyzingPage() {
  return (
    <Suspense fallback={null}>
      <AnalyzingScreen />
    </Suspense>
  );
}
