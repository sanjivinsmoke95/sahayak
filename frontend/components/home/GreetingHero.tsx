'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { useSettingsStore, useUiStore } from '@/store';

/** Greeting + the one dominant action: upload a document. */
export function GreetingHero() {
  const router = useRouter();
  const { t } = useTranslation();
  const displayName = useSettingsStore((s) => s.displayName);
  const setDirection = useUiStore((s) => s.setDirection);

  const hour = new Date().getHours();
  const greetKey = hour < 12 ? 'greetMorning' : hour < 17 ? 'greetAfternoon' : 'greetEvening';

  return (
    <section>
      <h1 className="text-2xl font-bold leading-tight">
        {t(greetKey)}
        {displayName ? `, ${displayName}` : ''} <span aria-hidden>👋</span>
      </h1>
      <p className="mt-1 text-base text-muted">{t('homeHelp')}</p>

      <button
        type="button"
        onClick={() => {
          setDirection('push');
          router.push('/upload');
        }}
        className="mt-4 flex w-full items-center gap-4 rounded-2xl bg-navy-600 p-4 text-left text-white shadow-lift transition active:translate-y-px"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15">
          <Icon name="upload" className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold leading-tight">{t('homeUploadTitle')}</span>
          <span className="mt-0.5 block text-sm text-navy-100">{t('homeUploadSub')}</span>
        </span>
        <Icon name="right" className="h-5 w-5 shrink-0 text-navy-200" />
      </button>
    </section>
  );
}
