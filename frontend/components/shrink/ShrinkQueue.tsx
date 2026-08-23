'use client';

import { EmptyState } from '@/components/common';
import { useTranslation } from '@/hooks';
import type { ShrinkEntry, ShrinkResult } from '@/types';
import { ShrinkResultRow } from './ShrinkResultRow';

interface ShrinkQueueProps {
  entries: ShrinkEntry[];
  results: Record<string, 'working' | ShrinkResult>;
  outUrls: Record<string, string | null>;
  onClear: () => void;
}

export function ShrinkQueue({ entries, results, outUrls, onClear }: ShrinkQueueProps) {
  const { t } = useTranslation();

  if (!entries.length) {
    return <EmptyState icon="shrink" title={t('shrinkEmpty')} />;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <ShrinkResultRow
          key={entry.id}
          entry={entry}
          result={results[entry.id]}
          outUrl={outUrls[entry.id] ?? null}
        />
      ))}
      <button
        type="button"
        onClick={onClear}
        className="w-full rounded-2xl py-3.5 text-lg font-semibold text-muted active:bg-navy-50"
      >
        {t('shrinkClear')}
      </button>
    </div>
  );
}
