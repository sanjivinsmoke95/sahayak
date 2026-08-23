'use client';

import { cn } from '@/lib/utils';
import { buzz } from '@/utils/format';

interface Option<T extends string | boolean> {
  value: T;
  label: string;
  className?: string;
}

interface OptionGridProps<T extends string | boolean> {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  columns?: 2 | 3;
}

export function OptionGrid<T extends string | boolean>({
  value, onChange, options, columns = 3,
}: OptionGridProps<T>) {
  return (
    <div className={cn('grid gap-2', columns === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => {
            buzz();
            onChange(option.value);
          }}
          className={cn(
            'rounded-2xl border px-2 py-3.5 font-semibold transition',
            option.className ?? 'text-base',
            value === option.value
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
