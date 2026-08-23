import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full resize-none rounded-2xl border border-navy-200 bg-white px-4 py-3 text-base',
        'placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-navy-600 focus-visible:ring-offset-2',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
