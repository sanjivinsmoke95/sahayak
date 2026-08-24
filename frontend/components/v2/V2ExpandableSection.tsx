'use client';

import { useState } from 'react';
import { Icon } from '@/components/common';
import { cn } from '@/lib/utils';

interface V2ExpandableSectionProps {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function V2ExpandableSection({ title, icon, defaultOpen = false, children }: V2ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[16px] border border-[#D8D0C7] bg-white shadow-[0_1px_4px_rgba(25,18,14,0.06),0_2px_12px_rgba(25,18,14,0.04)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left active:bg-[#EDE9E3] rounded-[16px] transition"
      >
        {icon && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-[#E1F0EF] text-[#0C6E6B]">
            <Icon name={icon} className="h-4 w-4" />
          </span>
        )}
        <span className="v2-heading flex-1 text-base font-semibold text-[#19120E]">{title}</span>
        <Icon
          name="down"
          className={cn('h-5 w-5 shrink-0 text-[#7A6E68] transition-transform duration-150', open && 'rotate-180')}
        />
      </button>
      {open && <div className="border-t border-[#D8D0C7] px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}
