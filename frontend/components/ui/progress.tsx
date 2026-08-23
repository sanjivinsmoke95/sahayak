'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  total: number;
  tone?: 'leaf' | 'navy';
  className?: string;
}

export function Progress({ value, total, tone = 'leaf', className }: ProgressProps) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
      className={cn('h-3 w-full overflow-hidden rounded-full bg-navy-100', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          tone === 'leaf' ? 'bg-leaf-600' : 'bg-navy-600',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
