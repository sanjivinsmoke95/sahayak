'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui';
import { DeadlineChip, Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { useUiStore } from '@/store';
import type { SahayakDocument } from '@/types';
import { formatDate } from '@/utils/format';

const STATUS = {
  action: { tone: 'amber', key: 'statusAction' },
  done: { tone: 'leaf', key: 'statusDone' },
  info: { tone: 'grey', key: 'statusInfo' },
} as const;

/**
 * One document as a compact row — icon, name, type · date, a status pill and a
 * chevron. Shared by the Home "recent" list and the full Documents locker so
 * both read identically. Tapping opens the document.
 */
export function DocumentRow({ document: doc }: { document: SahayakDocument }) {
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

  const status = STATUS[doc.status] ?? STATUS.info;
  const received = formatDate(doc.received, language);

  return (
    <button
      type="button"
      onClick={() => {
        setDirection('push');
        router.push(`/documents/${doc.id}`);
      }}
      className="flex w-full items-center gap-3 p-3.5 text-left active:bg-navy-50"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
        <Icon name="doc" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold leading-snug">{tr(doc.title)}</span>
        <span className="mt-0.5 block truncate text-sm text-muted">
          {tr(CATS[doc.cat])}
          {received ? ` · ${received}` : ''}
        </span>
      </span>
      {/* Only surface a pill when there's something to act on or a completion —
          "for information" is the neutral default and needs no label. */}
      {(doc.status !== 'info' || doc.deadline) && (
        <span className="flex shrink-0 flex-col items-end gap-1 whitespace-nowrap">
          {doc.status !== 'info' && <Badge tone={status.tone}>{t(status.key)}</Badge>}
          {doc.deadline && <DeadlineChip iso={doc.deadline} />}
        </span>
      )}
      <Icon name="right" className="h-5 w-5 shrink-0 text-navy-300" />
    </button>
  );
}
