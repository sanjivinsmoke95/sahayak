'use client';

import Link from 'next/link';
import { Icon } from '@/components/common';
import { SampleDocumentList, UploadTiles } from '@/components/upload';
import { useTranslation } from '@/hooks';
import { useSettingsStore } from '@/store';

export default function UploadPage() {
  const { t } = useTranslation();
  const autoShrink = useSettingsStore((s) => s.autoShrink);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold leading-snug">{t('upTitle')}</h1>
        <p className="mt-2 text-lg leading-relaxed text-muted">{t('upSub')}</p>
      </header>

      <UploadTiles />

      <div className="space-y-1.5">
        <p className="flex items-center gap-2 text-base text-leaf-700">
          <Icon name="lock" className="h-4 w-4 shrink-0" />
          {t('upSafe')}
        </p>
        {autoShrink && (
          <Link href="/shrink" className="flex items-center gap-2 text-base font-medium text-navy-600">
            <Icon name="shrink" className="h-4 w-4 shrink-0" />
            {t('autoShrink')} · {t('voiceOn')}
          </Link>
        )}
      </div>

      <SampleDocumentList />
    </div>
  );
}
