'use client';

import { cn } from '@/lib/utils';

type Tone = 'teal' | 'good' | 'warn' | 'danger' | 'grey';

const tones: Record<Tone, string> = {
  teal: 'bg-[#EAF1FF] text-[#102D63]',
  good: 'bg-[#EAF7EF] text-[#2E9B67]',
  warn: 'bg-[#FFF3E3] text-[#F4A340]',
  danger: 'bg-[#FDE8EA] text-[#DC3545]',
  grey: 'bg-[#E8EDF5] text-[#667085]',
};

interface V2BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}

export function V2Badge({ tone = 'grey', children, className }: V2BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}

const STATUS_TONE_MAP: Record<string, Tone> = {
  action: 'warn', done: 'good', info: 'grey',
  discovered: 'grey', preparing: 'teal', ready: 'good',
  submitted: 'teal', under_review: 'warn',
  additional_information_required: 'warn',
  approved: 'good', rejected: 'danger', completed: 'good',
  satisfied: 'good', missing: 'warn', expired: 'danger', unknown: 'grey',
};

export function statusTone(status: string): Tone {
  return STATUS_TONE_MAP[status] ?? 'grey';
}
