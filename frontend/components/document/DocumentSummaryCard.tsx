'use client';

import { Icon } from '@/components/common';
import { Badge } from '@/components/ui';
import { useDocumentValidity, useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { SahayakDocument } from '@/types';
import { fill, formatDate, isValidIsoDate } from '@/utils/format';

function Meta({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className={truncate ? 'truncate text-sm font-semibold' : 'text-sm font-semibold'}>{value}</p>
    </div>
  );
}

/** The compact document identity card: type, status badge, key metadata, validity. */
export function DocumentSummaryCard({ document: doc }: { document: SahayakDocument }) {
  const { t, tr, language } = useTranslation();
  const { data: validity } = useDocumentValidity(doc.id);

  const title = doc.docType || tr(doc.title);
  const issuer = tr(doc.issuer);
  const received = formatDate(doc.received, language);
  const validUntil = validity && isValidIsoDate(validity.expiryDate)
    ? formatDate(validity.expiryDate, language)
    : isValidIsoDate(doc.deadline)
      ? formatDate(doc.deadline, language)
      : '';

  const status = validity?.status;
  const badge =
    status === 'valid'
      ? { tone: 'leaf' as const, label: t('valValid'), icon: 'check' }
      : status === 'expiring'
        ? { tone: 'amber' as const, label: t('valExpiring'), icon: 'clock' }
        : status === 'expired'
          ? { tone: 'alert' as const, label: t('valExpired'), icon: 'alert' }
          : { tone: 'grey' as const, label: tr(CATS[doc.cat]), icon: undefined };

  return (
    <section className="space-y-3 rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-700">
          <Icon name="doc" className="h-6 w-6" />
        </span>
        <h1 className="min-w-0 flex-1 pt-0.5 text-xl font-bold leading-snug">{title}</h1>
        <Badge tone={badge.tone}>
          {badge.icon && <Icon name={badge.icon} className="h-3.5 w-3.5" strokeWidth={2.6} />}
          {badge.label}
        </Badge>
      </div>

      {(issuer || received || validUntil) && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-navy-50 pt-3">
          <Meta label={t('docIssuedBy')} value={issuer} truncate />
          <Meta label={t('received')} value={received} />
          <Meta label={t('valExpires')} value={validUntil} />
        </div>
      )}

      {/* Validity banner — only when a real validity was found. */}
      {status && status !== 'unknown' && (
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl p-3',
            status === 'valid'
              ? 'bg-leaf-50 text-leaf-700'
              : status === 'expiring'
                ? 'bg-amberx-50 text-amberx-700'
                : 'bg-alert-50 text-alert-600',
          )}
        >
          <Icon name={status === 'valid' ? 'check' : status === 'expiring' ? 'clock' : 'alert'} className="h-5 w-5 shrink-0" strokeWidth={2.4} />
          <p className="text-sm font-semibold">
            {status === 'expired'
              ? t('valExpired')
              : typeof validity?.daysLeft === 'number'
                ? fill(t('valDaysLeft'), { n: validity.daysLeft })
                : status === 'valid'
                  ? t('valValid')
                  : t('valExpiring')}
          </p>
        </div>
      )}
    </section>
  );
}
