'use client';

import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { SIZE_TARGETS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { buzz } from '@/utils/format';

interface SizeTargetPickerProps {
  value: string;
  onChange: (id: string) => void;
}

/**
 * The control is the portal's limit, not a quality slider. Nobody knows what
 * "quality 0.6" means; everybody knows the form said "under 200 KB".
 */
export function SizeTargetPicker({ value, onChange }: SizeTargetPickerProps) {
  const { t } = useTranslation();

  const chips = [
    { id: 'best', label: t('bestShort') },
    ...[...SIZE_TARGETS].reverse().map((s) => ({ id: s.id, label: s.label })),
  ];

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-lg font-bold">{t('shrinkTarget')}</h2>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            aria-pressed={value === chip.id}
            onClick={() => {
              buzz();
              onChange(chip.id);
            }}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2.5 text-base font-bold transition',
              value === chip.id
                ? 'border-navy-600 bg-navy-600 text-white shadow-sm'
                : 'border-navy-200 bg-white text-navy-700 active:bg-navy-50',
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-base leading-relaxed text-muted">
        {value === 'best' ? t('shrinkQualityS') : t('shrinkPortalNote')}
      </p>
    </Card>
  );
}
