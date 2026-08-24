'use client';

import { cn } from '@/lib/utils';

interface V2CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'button';
}

export function V2Card({ children, className, onClick, as }: V2CardProps) {
  const Tag = as ?? (onClick ? 'button' : 'div');
  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'rounded-[16px] border border-[#D8D0C7] bg-white text-left',
        'shadow-[0_1px_4px_rgba(25,18,14,0.06),0_2px_12px_rgba(25,18,14,0.04)]',
        onClick && 'w-full active:bg-[#EDE9E3] transition',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
