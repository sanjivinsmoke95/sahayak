'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Buttons are deliberately large: 52px+ tall with real text beside every
 * icon. The audience includes people who are nervous about touchscreens.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-3 rounded-2xl border font-semibold transition ' +
    'shadow-sm active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-navy-600 text-white hover:bg-navy-700 border-navy-600',
        secondary: 'bg-white text-navy-700 hover:bg-navy-50 border-navy-200',
        quiet: 'bg-navy-50 text-navy-700 hover:bg-navy-100 border-transparent',
        success: 'bg-leaf-600 text-white hover:bg-leaf-700 border-leaf-600',
        danger: 'bg-white text-alert-600 hover:bg-alert-50 border-alert-100',
        ghost: 'border-transparent bg-transparent text-navy-700 hover:bg-navy-50 shadow-none',
      },
      size: {
        lg: 'px-6 py-4 text-lg',
        md: 'px-4 py-3 text-base',
        sm: 'px-3 py-2 text-sm',
        icon: 'h-11 w-11 p-0',
      },
      full: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'lg', full: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, full }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
