import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold',
  {
    variants: {
      tone: {
        navy: 'bg-navy-50 text-navy-700 border-navy-100',
        leaf: 'bg-leaf-50 text-leaf-700 border-leaf-100',
        amber: 'bg-amberx-50 text-amberx-700 border-amberx-100',
        alert: 'bg-alert-50 text-alert-600 border-alert-100',
        grey: 'bg-slate-100 text-muted border-slate-200',
      },
    },
    defaultVariants: { tone: 'navy' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { badgeVariants };
