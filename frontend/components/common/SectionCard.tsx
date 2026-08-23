import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

type Tone = 'navy' | 'leaf' | 'amber' | 'alert';

const TONES: Record<Tone, string> = {
  navy: 'bg-navy-50 text-navy-700',
  leaf: 'bg-leaf-50 text-leaf-700',
  amber: 'bg-amberx-50 text-amberx-700',
  alert: 'bg-alert-50 text-alert-700',
};

interface SectionCardProps {
  icon: string;
  title: string;
  tone?: Tone;
  id?: string;
  children: ReactNode;
}

/** One block on the explanation page: big icon, big heading, plain content. */
export function SectionCard({ icon, title, tone = 'navy', id, children }: SectionCardProps) {
  return (
    <section id={id} className="rounded-xl2 border border-navy-100 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-start gap-4">
        <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-2xl', TONES[tone])}>
          <Icon name={icon} className="h-7 w-7" />
        </span>
        <h2 className="pt-0.5 text-xl font-bold leading-snug">{title}</h2>
      </div>
      <div className="text-lg leading-relaxed text-ink">{children}</div>
    </section>
  );
}
