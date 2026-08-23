'use client';

import { DeadlineRow } from '@/components/deadlines';
import { EmptyState } from '@/components/common';
import { Skeleton } from '@/components/ui';
import { useDocuments, useTranslation } from '@/hooks';
import { daysUntil } from '@/utils/format';

export default function DeadlinesPage() {
  const { t } = useTranslation();
  const { data: documents, isLoading } = useDocuments();

  // Nearest date first; documents without a date drop to the bottom.
  const dated = (documents ?? [])
    .filter((d) => !!d.deadline)
    .sort((a, b) => daysUntil(a.deadline!) - daysUntil(b.deadline!));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{t('dlTitle')}</h1>
        <p className="mt-2 text-lg text-muted">{t('dlSub')}</p>
      </header>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : dated.length === 0 ? (
        <EmptyState icon="calendar" title={t('dlNone')} />
      ) : (
        <div className="space-y-3">
          {dated.map((doc) => (
            <DeadlineRow key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
