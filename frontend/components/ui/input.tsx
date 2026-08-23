import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'w-full rounded-2xl border border-navy-200 bg-white px-4 py-3.5 text-base',
        'placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-navy-600 focus-visible:ring-offset-2 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
