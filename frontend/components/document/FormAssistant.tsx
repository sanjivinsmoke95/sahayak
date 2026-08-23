'use client';

import { useState } from 'react';
import { Icon, SectionCard } from '@/components/common';
import { Button } from '@/components/ui';
import { useForm, useTranslation } from '@/hooks';
import { FORM_FIELD_INFO } from '@/lib/form-fields';
import type { SahayakDocument } from '@/types';
import { fill } from '@/utils/format';

function mask(value: string): string {
  const trimmed = value.replace(/\s/g, '');
  if (trimmed.length <= 3) return '•'.repeat(trimmed.length || 4);
  return '•'.repeat(Math.max(4, trimmed.length - 3)) + trimmed.slice(-3);
}

/**
 * Reads a government form and suggests values from the reader's own documents.
 * Nothing is entered or submitted anywhere — the reader copies what they
 * confirm, or downloads a plain draft. Sensitive values stay masked until
 * revealed.
 */
export function FormAssistant({ document: doc }: { document: SahayakDocument }) {
  const { t, tr } = useTranslation();
  const { data } = useForm(doc.id);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  if (!data || !data.isForm) return null;

  const download = () => {
    const lines = data.fields.map((f) => {
      const info = FORM_FIELD_INFO[f.key];
      const label = info ? tr(info.label) : f.key;
      return `${label}: ${f.suggestedValue ?? ''}`;
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${tr(doc.title) || 'form'}-draft.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SectionCard icon="doc" tone="navy" title={t('formTitle')}>
      <p className="-mt-1 mb-3 text-sm text-muted">{t('formSub')}</p>

      <div className="space-y-3">
        {data.fields.map((f) => {
          const info = FORM_FIELD_INFO[f.key];
          const label = info ? tr(info.label) : f.key;
          const explanation = info ? tr(info.explanation) : '';
          const value =
            f.sensitive && !revealed[f.key] && f.suggestedValue
              ? mask(f.suggestedValue)
              : f.suggestedValue;

          return (
            <div key={f.key} className="rounded-xl border border-navy-100 p-3">
              <p className="text-base font-semibold">{label}</p>
              {explanation && <p className="text-sm text-muted">{explanation}</p>}

              {f.suggestedValue ? (
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="break-words font-medium tabular-nums">{value}</span>
                  <span className="flex items-center gap-3">
                    {f.sensitive && (
                      <button
                        type="button"
                        onClick={() => setRevealed((r) => ({ ...r, [f.key]: !r[f.key] }))}
                        className="text-sm font-semibold text-navy-600"
                      >
                        {revealed[f.key] ? t('hideField') : t('revealField')}
                      </button>
                    )}
                    {f.source && (
                      <span className="text-xs text-muted">
                        {fill(t('formFrom'), { source: f.source })}
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted">{t('formNoValue')}</p>
              )}
            </div>
          );
        })}
      </div>

      <Button className="mt-4" size="md" variant="secondary" full onClick={download}>
        <Icon name="save" className="h-5 w-5" />
        {t('formDownload')}
      </Button>
    </SectionCard>
  );
}
