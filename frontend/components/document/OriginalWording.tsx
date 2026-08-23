'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { redactSensitive } from '@/lib/redact';
import type { SahayakDocument } from '@/types';

/**
 * The dense original, kept verbatim and in the language it was printed in.
 * It is deliberately not translated: this is the wording the reader has to
 * quote at the counter, and softening it would not survive contact with a
 * clerk holding the same letter.
 */
export function OriginalWording({ document: doc }: { document: SahayakDocument }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button variant="secondary" size="md" full onClick={() => setOpen((v) => !v)}>
        {open ? t('hideOriginal') : t('viewExtracted')}
      </Button>

      {open && (
        <Card className="mt-3 animate-rise p-4">
          <p className="mb-3 text-sm text-muted">{t('govNote')}</p>
          <pre className="notice-paper overflow-x-auto whitespace-pre-wrap rounded-lg p-4 font-sans text-sm leading-[1.7] text-slate-700">
            {redactSensitive(doc.original)}
          </pre>
        </Card>
      )}
    </div>
  );
}
