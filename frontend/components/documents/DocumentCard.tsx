'use client';

import { useRouter } from 'next/navigation';
import { Badge, Card } from '@/components/ui';
import { DeadlineChip, Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { useUiStore } from '@/store';
import type { SahayakDocument } from '@/types';
import { formatDate } from '@/utils/format';

interface DocumentCardProps {
  document: SahayakDocument;
  onDelete?: (id: string) => void;
}

export function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

  const statusTone = doc.status === 'action' ? 'amber' : doc.status === 'done' ? 'leaf' : 'grey';
  const statusLabel =
    doc.status === 'action' ? t('statusAction') : doc.status === 'done' ? t('statusDone') : t('statusInfo');

  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={() => {
          setDirection('push');
          router.push(`/documents/${doc.id}`);
        }}
        className="flex w-full items-start gap-3.5 text-left"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
          <Icon name="doc" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold leading-snug">{tr(doc.title)}</span>
          <span className="mt-0.5 block text-base text-muted">{tr(CATS[doc.cat])}</span>
          <span className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={statusTone}>{statusLabel}</Badge>
            <DeadlineChip iso={doc.deadline} />
          </span>
          <span className="mt-2 block text-sm text-muted">
            {t('received')}: {formatDate(doc.received, language)}
          </span>
        </span>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(doc.id)}
          className="mt-3 flex items-center gap-2 rounded-xl px-2 py-2 text-base font-semibold text-alert-600 active:bg-alert-50"
        >
          <Icon name="trash" className="h-5 w-5" />
          {t('removeDoc')}
        </button>
      )}
    </Card>
  );
}
