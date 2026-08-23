'use client';

import { Icon, SectionCard } from '@/components/common';
import { useTranslation, useVerification } from '@/hooks';
import type { StringKey } from '@/lib/i18n';
import type { SahayakDocument } from '@/types';

const LABEL: Record<string, StringKey> = {
  certificate_number: 'verCertNo',
  issuing_authority: 'verAuthority',
  qr_code: 'verQr',
  digital_signature: 'verSignature',
  verification_url: 'verUrl',
};

/**
 * Verification *signals* — never a claim of authenticity. Shows which markers
 * were found and points to the official verification service.
 */
export function VerificationSignals({ document: doc }: { document: SahayakDocument }) {
  const { t } = useTranslation();
  const { data } = useVerification(doc.id);

  if (!data || !data.signals.some((s) => s.detected)) return null;

  const url = data.signals.find((s) => s.type === 'verification_url' && s.detected)?.value;

  return (
    <SectionCard icon="lock" tone="navy" title={t('verTitle')}>
      <ul className="space-y-2.5">
        {data.signals.map((s) => (
          <li key={s.type} className="flex items-center gap-3">
            <span className={s.detected ? 'text-leaf-600' : 'text-slate-300'}>
              <Icon name={s.detected ? 'check' : 'close'} className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="min-w-0 flex-1 text-base">
              {t(LABEL[s.type])}
              {s.value && <span className="ml-2 font-mono text-sm text-muted">{s.value}</span>}
            </span>
            <span className="shrink-0 text-sm text-muted">
              {s.detected ? t('verDetected') : t('verNotDetected')}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 rounded-xl bg-navy-50 p-3 text-sm leading-relaxed text-muted">
        {t('verNote')}
      </p>
      {url && (
        <a
          href={url.startsWith('http') ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-navy-600"
        >
          <Icon name="globe" className="h-4 w-4" />
          {t('verOpenLink')}
        </a>
      )}
    </SectionCard>
  );
}
