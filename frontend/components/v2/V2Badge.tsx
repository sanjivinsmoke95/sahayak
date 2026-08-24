'use client';

import { cn } from '@/lib/utils';

type Tone = 'teal' | 'good' | 'warn' | 'danger' | 'grey';

const tones: Record<Tone, string> = {
  teal: 'bg-[#E1F0EF] text-[#0C6E6B]',
  good: 'bg-[#ECF7F1] text-[#2D7A4F]',
  warn: 'bg-[#FDF3E1] text-[#C97B1A]',
  danger: 'bg-[#FDEEEC] text-[#C0392B]',
  grey: 'bg-[#EDE9E3] text-[#7A6E68]',
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
