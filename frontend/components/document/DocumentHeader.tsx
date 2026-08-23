'use client';

import { Badge } from '@/components/ui';
import { DeadlineChip, Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import type { SahayakDocument } from '@/types';
import { formatDate } from '@/utils/format';

export function DocumentHeader({ document: doc }: { document: SahayakDocument }) {
  const { t, tr, language } = useTranslation();
  const receivedLabel = formatDate(doc.received, language);

  return (
    <header className="space-y-3">
      {doc.seeded && (
        <Badge tone="grey">
          <Icon name="info" className="h-4 w-4" />
          {t('demoDoc')}
        </Badge>
      )}
      <h1 className="text-2xl font-bold leading-snug">{tr(doc.title)}</h1>
      <p className="text-base text-muted">{tr(doc.issuer)}</p>
      {doc.refNo && <p className="font-mono text-sm text-muted">{doc.refNo}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="navy">{tr(CATS[doc.cat])}</Badge>
        <DeadlineChip iso={doc.deadline} />
      </div>
      {receivedLabel && (
        <p className="text-sm text-muted">
          {t('received')}: {receivedLabel}
        </p>
      )}
    </header>
  );
}
