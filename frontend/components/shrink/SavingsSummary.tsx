'use client';

import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { fill, humanBytes, transferSeconds } from '@/utils/format';

interface SavingsSummaryProps {
  savedBytes: number;
  totalBefore: number;
  totalAfter: number;
}

/** Bytes are abstract; "two minutes instead of ten seconds" is not. */
export function SavingsSummary({ savedBytes, totalBefore, totalAfter }: SavingsSummaryProps) {
  const { t } = useTranslation();
  if (savedBytes <= 0) return null;

  const phrase = (bytes: number) => {
    const seconds = transferSeconds(bytes);
    return seconds < 60
      ? `${seconds} ${t('seconds')}`
      : `${Math.round(seconds / 60)} ${t('minutes')}`;
  };

  return (
    <Card className="animate-rise border-leaf-100 bg-leaf-50 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-lg font-bold text-leaf-700">{t('shrinkTotal')}</span>
        <span className="text-3xl font-bold text-leaf-700">{humanBytes(savedBytes)}</span>
      </div>
      <p className="mt-1.5 text-base leading-relaxed text-leaf-700/80">
        {fill(t('shrinkOnData'), { old: phrase(totalBefore), new: phrase(totalAfter) })}
      </p>
    </Card>
  );
}
