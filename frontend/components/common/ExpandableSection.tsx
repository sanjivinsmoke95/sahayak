'use client';

import { useState, type ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * A collapsible "More information" section — a light row that reveals its
 * children on demand. Used for progressive disclosure so a document page leads
 * with the answer, not a wall of detail.
 */
export function ExpandableSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl2 border border-navy-100 bg-white shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left active:bg-navy-50"
      >
        {icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
        <span className="flex-1 text-base font-bold leading-snug">{title}</span>
        <Icon
          name={open ? 'up' : 'down'}
          className="h-5 w-5 shrink-0 text-navy-300"
          strokeWidth={2.4}
        />
      </button>
      {open && <div className="space-y-4 border-t border-navy-50 p-4 animate-rise">{children}</div>}
    </div>
  );
}
