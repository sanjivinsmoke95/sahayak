'use client';

import Link from 'next/link';
import { Icon } from '@/components/common';
import { SampleDocumentList, UploadTiles } from '@/components/upload';
import { useTranslation } from '@/hooks';
import { useSettingsStore } from '@/store';

export default function V2UploadPage() {
  const { t } = useTranslation();
  const autoShrink = useSettingsStore((s) => s.autoShrink);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="v2-heading text-2xl font-bold leading-snug text-[#19120E]">{t('upTitle')}</h1>
        <p className="mt-2 text-base leading-relaxed text-[#7A6E68]">{t('upSub')}</p>
      </header>

      <UploadTiles />

      <div className="space-y-1.5">
        <p className="flex items-center gap-2 text-sm text-[#2D7A4F]">
          <Icon name="lock" className="h-4 w-4 shrink-0" />
          {t('upSafe')}
        </p>
        {autoShrink && (
          <Link href="/v2/settings" className="flex items-center gap-2 text-sm font-medium text-[#0C6E6B]">
            <Icon name="shrink" className="h-4 w-4 shrink-0" />
            {t('autoShrink')} · {t('voiceOn')}
          </Link>
        )}
      </div>

      <SampleDocumentList />
    </div>
  );
}
