'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { DeadlineChip, Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import type { SahayakDocument } from '@/types';
import { formatDate } from '@/utils/format';

export function DeadlineRow({ document: doc }: { document: SahayakDocument }) {
  const router = useRouter();
  const { tr, language } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

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
          <Icon name="calendar" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold leading-snug">{tr(doc.title)}</span>
          {doc.deadline && (
            <span className="mt-0.5 block text-base text-muted">
              {formatDate(doc.deadline, language)}
            </span>
          )}
          <span className="mt-2 block">
            <DeadlineChip iso={doc.deadline} />
          </span>
        </span>
      </button>
    </Card>
  );
}
