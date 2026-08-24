'use client';

import Link from 'next/link';
import { Icon } from '@/components/common';
import { SampleDocumentList, UploadTiles } from '@/components/upload';
import { V2Illustration } from '@/components/v2';
import { useTranslation } from '@/hooks';
import { useSettingsStore } from '@/store';

export default function V2UploadPage() {
  const { t } = useTranslation();
  const autoShrink = useSettingsStore((s) => s.autoShrink);

  return (
    <div className="space-y-5">
      <header className="flex flex-col items-center pt-2 text-center">
        <V2Illustration name="upload" className="mb-4 h-32 w-32" />
        <h1 className="v2-heading text-2xl font-extrabold leading-snug text-[#101828]">{t('upTitle')}</h1>
        <p className="mt-2 text-base leading-relaxed text-[#667085]">{t('upSub')}</p>
      </header>

      <UploadTiles />

      <div className="space-y-1.5">
        <p className="flex items-center gap-2 text-sm text-[#2E9B67]">
          <Icon name="lock" className="h-4 w-4 shrink-0" />
          {t('upSafe')}
        </p>
        {autoShrink && (
          <Link href="/v2/settings" className="flex items-center gap-2 text-sm font-medium text-[#102D63]">
            <Icon name="shrink" className="h-4 w-4 shrink-0" />
            {t('autoShrink')} · {t('voiceOn')}
          </Link>
        )}
      </div>

      <SampleDocumentList />
    </div>
  );
}
