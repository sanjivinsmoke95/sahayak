'use client';

import { SectionCard } from '@/components/common';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import type { SahayakDocument } from '@/types';

/**
 * Officialese beside what it actually means.
 *
 * Shown as pairs rather than a replacement because the reader still has to
 * recognise the original phrase when a clerk says it out loud.
 */
export function JargonPairs({ document: doc }: { document: SahayakDocument }) {
  const { t, tr } = useTranslation();

  if (!doc.pairs?.length) return null;

  return (
    <SectionCard icon="translate" title={t('pairsTitle')}>
      <ul className="space-y-4">
        {doc.pairs.map((pair, index) => (
          <li key={index} className="space-y-2">
            <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed text-slate-600">
              {pair.gov}
            </p>
            <p className="flex items-start gap-2 px-1 text-base leading-relaxed">
              <Icon name="right" className="mt-1 h-4 w-4 shrink-0 text-leaf-600" strokeWidth={2.5} />
              <span>{tr(pair.simple)}</span>
            </p>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
