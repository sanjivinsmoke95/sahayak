'use client';

import { cn } from '@/lib/utils';

type V2InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function V2Input({ className, ...props }: V2InputProps) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-[12px] border border-[#D8D0C7] bg-white px-4 py-3 text-base text-[#19120E]',
        'placeholder:text-[#7A6E68] outline-none transition',
        'focus:border-[#0C6E6B] focus:ring-2 focus:ring-[#E1F0EF]',
        className,
      )}
    />
  );
}

export function V2Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'w-full rounded-[12px] border border-[#D8D0C7] bg-white px-4 py-3 text-base text-[#19120E]',
        'placeholder:text-[#7A6E68] outline-none transition resize-none',
        'focus:border-[#0C6E6B] focus:ring-2 focus:ring-[#E1F0EF]',
        className,
      )}
    />
  );
}
