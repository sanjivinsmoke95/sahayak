'use client';

import { cn } from '@/lib/utils';

type V2InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function V2Input({ className, ...props }: V2InputProps) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-[12px] border border-[#D6DDE8] bg-white px-4 py-3 text-base text-[#101828]',
        'placeholder:text-[#667085] outline-none transition',
        'focus:border-[#102D63] focus:ring-2 focus:ring-[#EAF1FF]',
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
        'w-full rounded-[12px] border border-[#D6DDE8] bg-white px-4 py-3 text-base text-[#101828]',
        'placeholder:text-[#667085] outline-none transition resize-none',
        'focus:border-[#102D63] focus:ring-2 focus:ring-[#EAF1FF]',
        className,
      )}
    />
  );
}
