'use client';

import { Icon } from '@/components/common';
import { V2Button } from './V2Button';

interface V2EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function V2EmptyState({ icon, title, description, actionLabel, onAction }: V2EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-[16px] border border-[#D8D0C7] bg-white px-6 py-10 text-center shadow-[0_1px_4px_rgba(25,18,14,0.06),0_2px_12px_rgba(25,18,14,0.04)]">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-[#EDE9E3] text-[#7A6E68]">
        <Icon name={icon} className="h-7 w-7" />
      </span>
      <p className="v2-heading mt-4 text-lg font-semibold text-[#19120E]">{title}</p>
      {description && <p className="mt-2 text-sm text-[#7A6E68]">{description}</p>}
      {actionLabel && onAction && (
        <V2Button size="md" className="mt-5" onClick={onAction}>
          {actionLabel}
        </V2Button>
      )}
    </div>
  );
}
