'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { SAMPLE_DOCUMENTS } from '@/lib/data/sample-documents';
import { useUiStore } from '@/store';

/** Demo notices, so the whole journey can be shown without a real upload. */
export function SampleDocumentList() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

  return (
    <div>
      <h2 className="mb-3 text-xl font-bold">{t('upOr')}</h2>
      <div className="space-y-2.5">
        {SAMPLE_DOCUMENTS.map((doc) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => {
              setDirection('push');
              router.push(`/analyzing?sampleId=${doc.id}`);
            }}
            className="flex w-full items-start gap-3.5 rounded-2xl border border-navy-100 bg-white p-4 text-left shadow-soft active:bg-navy-50"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
              <Icon name="doc" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold leading-snug">{tr(doc.title)}</span>
              <span className="mt-0.5 block text-base text-muted">{tr(CATS[doc.cat])}</span>
            </span>
            <Badge tone="grey">{t('sampleBadge')}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
