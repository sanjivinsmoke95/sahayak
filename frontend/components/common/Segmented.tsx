'use client';

import { cn } from '@/lib/utils';
import { buzz } from '@/utils/format';

interface SegmentedOption {
  id: string;
  label: string;
}

interface SegmentedProps {
  value: string;
  onChange: (id: string) => void;
  options: SegmentedOption[];
  label: string;
}

export function Segmented({ value, onChange, options, label }: SegmentedProps) {
  return (
    <div role="group" aria-label={label} className="flex gap-1.5 rounded-2xl bg-navy-50 p-1.5">
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
            'flex-1 rounded-xl px-1 py-2.5 text-base font-bold transition',
            value === option.id ? 'bg-navy-600 text-white shadow-sm' : 'text-navy-700 active:bg-white',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
