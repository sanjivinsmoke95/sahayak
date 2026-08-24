'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { V2Button, V2Illustration, V2IndiaRibbon } from '@/components/v2';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';

function SuccessScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const docId = params.get('doc');

  const go = (path: string) => { setDirection('push'); router.push(path); };

  return (
    <div className="relative flex min-h-[72vh] flex-col items-center justify-center text-center">
      <V2Illustration name="success" className="mb-6 h-44 w-44" />

      <h1 className="v2-heading text-2xl font-extrabold text-[#101828]">{t('successTitle')}</h1>
      <p className="mt-2 max-w-[17rem] text-base leading-relaxed text-[#667085]">{t('successSub')}</p>

      <div className="mt-8 w-full max-w-[19rem] space-y-2.5">
        {docId && (
          <V2Button full size="lg" onClick={() => router.replace(`/v2/documents/${docId}`)}>
            {t('successView')}
          </V2Button>
        )}
        <V2Button full size="lg" variant="secondary" onClick={() => go('/v2')}>
          {t('successHome')}
        </V2Button>
      </div>

      <V2IndiaRibbon className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-90" />
    </div>
  );
}

export default function V2SuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessScreen />
    </Suspense>
  );
}
