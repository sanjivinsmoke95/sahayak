'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useDocumentUpload, useTranslation } from '@/hooks';
import { useSettingsStore, useUiStore } from '@/store';
import { buzz } from '@/utils/format';

/** Greeting plus the two things people actually opened the app to do. */
export function HeroActions() {
  const router = useRouter();
  const { t } = useTranslation();
  const cameraRef = useRef<HTMLInputElement>(null);
  const displayName = useSettingsStore((s) => s.displayName);
  const setDirection = useUiStore((s) => s.setDirection);
  const { handleFile } = useDocumentUpload();

  const push = (href: string) => {
    setDirection('push');
    router.push(href);
  };

  return (
    <section>
      <p className="text-lg font-semibold text-navy-600">
        {t('greeting')} 🙏{displayName ? `, ${displayName}` : ''}
      </p>
      <h1 className="mt-1.5 text-[1.85rem] font-bold leading-[1.15] tracking-tight">{t('tagline')}</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted">{t('heroSub')}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            buzz();
            cameraRef.current?.click();
          }}
          className="col-span-2 flex h-28 items-center gap-4 rounded-xl2 bg-navy-600 px-5 text-white shadow-lift active:translate-y-px"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15">
            <Icon name="scan" className="h-8 w-8" />
          </span>
          <span className="min-w-0 text-left">
            <span className="block text-xl font-bold leading-tight">{t('btnPhoto')}</span>
            <span className="mt-0.5 block text-base leading-snug text-navy-100">{t('scanFab')}</span>
          </span>
        </button>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        <button
          type="button"
          onClick={() => push('/upload')}
          className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl2 border border-navy-100 bg-white px-2 text-navy-700 shadow-soft active:bg-navy-50"
        >
          <Icon name="upload" className="h-7 w-7 text-navy-600" />
          <span className="text-center text-base font-bold leading-tight">{t('btnUpload')}</span>
        </button>
        <button
          type="button"
          onClick={() => push('/assistant?listen=1')}
          className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl2 border border-navy-100 bg-white px-2 text-navy-700 shadow-soft active:bg-navy-50"
        >
          <Icon name="mic" className="h-7 w-7 text-navy-600" />
          <span className="text-center text-base font-bold leading-tight">{t('btnVoice')}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => push('/analyzing?sampleId=pension')}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-lg font-semibold text-navy-600 active:bg-navy-50"
      >
        <Icon name="play" className="h-5 w-5" />
        {t('demoBtn')}
      </button>
    </section>
  );
}
