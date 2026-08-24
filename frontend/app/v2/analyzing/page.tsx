'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/common';
import { V2Illustration } from '@/components/v2';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import type { StringKey } from '@/lib/i18n';

const STEP_KEYS: StringKey[] = ['an1', 'an2', 'an5'];

function AnalyzingScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const docId = params.get('doc');
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEP_KEYS.length));
    }, 900);
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
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <V2Illustration name="processing" className="mb-7 h-40 w-40 animate-[pulse_2s_ease-in-out_infinite]" />

      <h1 className="v2-heading text-xl font-extrabold text-[#101828]">{t('anTitle')}</h1>
      <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-[#667085]">{t('anCalm')}</p>

      <ul className="mt-7 w-full max-w-[17rem] space-y-2.5 text-left">
        {STEP_KEYS.map((key, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={key} className="flex items-center gap-3">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full transition ${
                  done
                    ? 'bg-[#2E9B67] text-white'
                    : active
                      ? 'bg-[#EAF1FF] text-[#102D63]'
                      : 'bg-[#E8EDF5] text-[#667085]'
                }`}
              >
                {done ? (
                  <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                ) : active ? (
                  <span className="h-2 w-2 animate-ping rounded-full bg-[#102D63]" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B9C4D6]" />
                )}
              </span>
              <span
                className={`text-sm font-medium transition ${
                  done || active ? 'text-[#101828]' : 'text-[#667085]'
                }`}
              >
                {t(key)}
              </span>
            </li>
          );
        })}
      </ul>
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
