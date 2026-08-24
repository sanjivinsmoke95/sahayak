'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'lg' | 'md' | 'sm' | 'icon';

const base =
  'inline-flex items-center justify-center gap-2.5 font-semibold transition ' +
  'active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102D63] focus-visible:ring-offset-2';

const variants: Record<Variant, string> = {
  primary: 'bg-[#102D63] text-white shadow-sm active:bg-[#0A2149]',
  secondary: 'bg-white text-[#102D63] border border-[#D6DDE8] shadow-sm active:bg-[#E8EDF5]',
  danger: 'bg-[#DC3545] text-white shadow-sm active:bg-[#B02A37]',
  ghost: 'bg-transparent text-[#102D63] active:bg-[#EAF1FF]',
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
