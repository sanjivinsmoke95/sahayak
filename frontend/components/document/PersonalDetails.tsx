'use client';

import { useState } from 'react';
import { SectionCard } from '@/components/common';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import type { PersonalField, SahayakDocument } from '@/types';

/** Show the last few characters, mask the rest: "••••••••89J". */
function mask(value: string): string {
  const trimmed = value.replace(/\s+/g, '');
  if (trimmed.length <= 3) return '•'.repeat(trimmed.length || 4);
  const tail = trimmed.slice(-3);
  return '•'.repeat(Math.max(4, trimmed.length - 3)) + tail;
}

function FieldRow({ field }: { field: PersonalField }) {
  const { t, tr } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const showValue = field.sensitive && !revealed ? mask(field.value) : field.value;

  return (
    <div className="flex items-start justify-between gap-3 border-b border-navy-50 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-muted">{tr(field.label)}</p>
        <p className="mt-0.5 break-words font-medium tabular-nums">{showValue}</p>
      </div>
      {field.sensitive && (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-navy-600 hover:bg-navy-50"
          aria-pressed={revealed}
        >
          <Icon name={revealed ? 'lock' : 'search'} className="h-4 w-4" />
          {revealed ? t('hideField') : t('revealField')}
        </button>
      )}
    </div>
  );
}

/** Structured personal details read from the document, sensitive ones masked. */
export function PersonalDetails({ document: doc }: { document: SahayakDocument }) {
  const { t } = useTranslation();
  const fields = doc.personal ?? [];
  if (fields.length === 0) return null;

  return (
    <SectionCard icon="user" tone="navy" title={t('personalTitle')}>
      <p className="-mt-1 mb-3 text-sm text-muted">{t('personalSub')}</p>
      <div>
        {fields.map((field, index) => (
          <FieldRow key={index} field={field} />
        ))}
      </div>
    </SectionCard>
  );
}
