'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'lg' | 'md' | 'sm' | 'icon';

const base =
  'inline-flex items-center justify-center gap-2.5 font-semibold transition ' +
  'active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C6E6B] focus-visible:ring-offset-2';

const variants: Record<Variant, string> = {
  primary: 'bg-[#0C6E6B] text-white shadow-sm active:bg-[#095856]',
  secondary: 'bg-white text-[#0C6E6B] border border-[#D8D0C7] shadow-sm active:bg-[#EDE9E3]',
  danger: 'bg-[#C0392B] text-white shadow-sm active:bg-[#A33225]',
  ghost: 'bg-transparent text-[#0C6E6B] active:bg-[#E1F0EF]',
};

const sizes: Record<Size, string> = {
  lg: 'px-6 py-3.5 text-lg rounded-full',
  md: 'px-4 py-3 text-base rounded-full',
  sm: 'px-3 py-2 text-sm rounded-full',
  icon: 'h-11 w-11 p-0 rounded-full',
};

interface V2ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export const V2Button = React.forwardRef<HTMLButtonElement, V2ButtonProps>(
  ({ className, variant = 'primary', size = 'lg', full, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], full && 'w-full', className)}
      {...props}
    />
  ),
);
V2Button.displayName = 'V2Button';
