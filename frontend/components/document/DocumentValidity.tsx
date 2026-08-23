'use client';

import { SectionCard } from '@/components/common';
import { useDocumentValidity, useTranslation } from '@/hooks';
import type { SahayakDocument } from '@/types';
import { fill, formatDate } from '@/utils/format';

/**
 * The document's own validity (issue/expiry), shown only when a real expiry was
 * found in the text. When none is present the section is hidden rather than
 * inventing a validity period.
 */
export function DocumentValidity({ document: doc }: { document: SahayakDocument }) {
  const { t, language } = useTranslation();
  const { data } = useDocumentValidity(doc.id);

  if (!data || data.status === 'unknown') return null;

  const tone = data.status === 'valid' ? 'leaf' : data.status === 'expiring' ? 'amber' : 'alert';
  const label =
    data.status === 'valid'
      ? t('valValid')
      : data.status === 'expiring'
        ? t('valExpiring')
        : t('valExpired');

  return (
    <SectionCard icon="calendar" tone={tone} title={t('valTitle')}>
      <p className="text-xl font-bold leading-snug">{label}</p>
      <div className="mt-1.5 space-y-0.5 text-sm text-muted">
        {data.issueDate && (
          <p>
            {t('valIssued')}: {formatDate(data.issueDate, language)}
          </p>
        )}
        {data.expiryDate && (
          <p>
            {t('valExpires')}: {formatDate(data.expiryDate, language)}
          </p>
        )}
      </div>
      {typeof data.daysLeft === 'number' && data.daysLeft >= 0 && (
        <p className="mt-2 text-base font-semibold">{fill(t('valDaysLeft'), { n: data.daysLeft })}</p>
      )}
    </SectionCard>
  );
}
