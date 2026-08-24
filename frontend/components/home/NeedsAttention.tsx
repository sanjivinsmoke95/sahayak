'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useDocuments, useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import { daysUntil, fill, isValidIsoDate } from '@/utils/format';

/**
 * Documents with a deadline coming up soon. Grounded in real deadline data —
 * hidden entirely when nothing needs attention (no invented alerts).
 */
export function NeedsAttention() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const { data: documents } = useDocuments();
  const setDirection = useUiStore((s) => s.setDirection);

  const items = (documents ?? [])
    .filter((d) => isValidIsoDate(d.deadline))
    .map((d) => ({ doc: d, days: daysUntil(d.deadline as string) }))
    .filter((x) => x.days >= 0 && x.days <= 45)
    .sort((a, b) => a.days - b.days)
    .slice(0, 2);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="attn-heading" className="space-y-2">
      <h2 id="attn-heading" className="text-sm font-bold text-amberx-700">
        {t('attnTitle')}
      </h2>
      {items.map(({ doc, days }) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 rounded-xl2 border border-amberx-100 bg-amberx-50 p-3.5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-amberx-600">
            <Icon name="alert" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-amberx-700">{t('attnTitle')}</p>
            <p className="truncate text-sm text-amberx-700">
              {fill(t('attnExpires'), { name: tr(doc.title), n: days })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDirection('push');
              router.push(`/documents/${doc.id}`);
            }}
            className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-amberx-700"
          >
            {t('attnReview')}
          </button>
        </div>
      ))}
    </section>
  );
}
