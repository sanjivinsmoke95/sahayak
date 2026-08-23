'use client';

import { useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { DocumentCategory } from '@/types';
import { buzz } from '@/utils/format';

interface CategoryFilterProps {
  value: DocumentCategory | 'all';
  onChange: (value: DocumentCategory | 'all') => void;
  available: DocumentCategory[];
}

export function CategoryFilter({ value, onChange, available }: CategoryFilterProps) {
  const { t, tr } = useTranslation();

  const options: Array<{ id: DocumentCategory | 'all'; label: string }> = [
    { id: 'all', label: t('catAll') },
    ...available.map((cat) => ({ id: cat, label: tr(CATS[cat]) })),
  ];

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => {
            buzz();
            onChange(option.id);
          }}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-base font-semibold transition',
            value === option.id
              ? 'border-navy-600 bg-navy-600 text-white'
              : 'border-navy-200 bg-white text-navy-700',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
