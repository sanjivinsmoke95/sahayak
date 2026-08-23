'use client';

import { Icon, SectionCard } from '@/components/common';
import { useRejection, useTranslation } from '@/hooks';
import type { SahayakDocument } from '@/types';

/**
 * Explains a rejection notice: the reason it gives (quoted, or "not stated"),
 * what the reader can do, and any contact/appeal route found in the notice.
 * Renders only when the document reads as a rejection.
 */
export function RejectionExplainer({ document: doc }: { document: SahayakDocument }) {
  const { t } = useTranslation();
  const { data } = useRejection(doc.id);

  if (!data || !data.isRejection) return null;

  const { appeal } = data;
  const hasAppeal = appeal.phones.length + appeal.emails.length + appeal.urls.length > 0;

  return (
    <SectionCard icon="alert" tone="alert" title={t('rejTitle')}>
      <div>
        <p className="font-semibold">{t('rejReasonTitle')}</p>
        <p className="mt-1 leading-relaxed">
          {data.reasonStated && data.reason ? data.reason : t('rejNoReason')}
        </p>
      </div>

      {data.suggestedActions.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold">{t('rejActionsTitle')}</p>
          <ul className="mt-1.5 space-y-1.5">
            {data.suggestedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-base leading-relaxed">
                <Icon name="right" className="mt-1 h-4 w-4 shrink-0 text-navy-500" strokeWidth={2.4} />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasAppeal && (
        <div className="mt-4">
          <p className="font-semibold">{t('rejAppealTitle')}</p>
          <div className="mt-1 space-y-1 text-sm">
            {appeal.phones.map((p) => (
              <a key={p} href={`tel:${p}`} className="block font-semibold text-navy-600">
                {p}
              </a>
            ))}
            {appeal.emails.map((e) => (
              <a key={e} href={`mailto:${e}`} className="block font-semibold text-navy-600">
                {e}
              </a>
            ))}
            {appeal.urls.map((u) => (
              <a
                key={u}
                href={u.startsWith('http') ? u : `https://${u}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all font-semibold text-navy-600"
              >
                {u}
              </a>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
