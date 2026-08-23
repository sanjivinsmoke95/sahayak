'use client';

import { cn } from '@/lib/utils';
import { Icon } from './Icon';

/** A compact horizontal stepper. `current` is the active step index. */
export function Timeline({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-start">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label + i} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span
                className={cn('h-0.5 flex-1', i === 0 ? 'bg-transparent' : done ? 'bg-navy-600' : 'bg-navy-100')}
              />
              <span
                className={cn(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-full',
                  done
                    ? 'bg-navy-600 text-white'
                    : active
                      ? 'bg-navy-600 text-white ring-4 ring-navy-100'
                      : 'bg-navy-100',
                )}
              >
                {done ? (
                  <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                ) : (
                  <span className={cn('h-1.5 w-1.5 rounded-full', active ? 'bg-white' : 'bg-navy-300')} />
                )}
              </span>
              <span
                className={cn(
                  'h-0.5 flex-1',
                  i === steps.length - 1 ? 'bg-transparent' : done ? 'bg-navy-600' : 'bg-navy-100',
                )}
              />
            </div>
            <span
              className={cn(
                'mt-1.5 px-0.5 text-center text-[10px] leading-tight',
                active ? 'font-bold text-navy-700' : 'text-muted',
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
