'use client';

import { Card } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';

const TONES = {
  grey: 'bg-slate-50 border-slate-200 text-slate-600',
  navy: 'bg-navy-50 border-navy-100 text-ink',
  leaf: 'bg-leaf-50 border-leaf-100 text-ink',
} as const;

const CHIPS = {
  grey: 'bg-slate-200 text-slate-700',
  navy: 'bg-navy-600 text-white',
  leaf: 'bg-leaf-600 text-white',
} as const;

interface RungProps {
  step: number;
  label: string;
  text: string;
  tone: keyof typeof TONES;
  big?: boolean;
}

function Rung({ step, label, text, tone, big }: RungProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold', CHIPS[tone])}>
          {step}
        </span>
        <span className="text-base font-semibold">{label}</span>
      </div>
      <div className={cn('rounded-2xl border px-4 py-3 leading-relaxed', TONES[tone], big ? 'text-lg font-semibold' : 'text-base')}>
        {text}
      </div>
    </div>
  );
}

/**
 * The signature moment: one sentence shown three times, ending in the
 * reader's own language. Switching language changes only the third rung.
 */
export function LanguageLadder() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="ladder-heading">
      <h2 id="ladder-heading" className="mb-1.5 text-2xl font-bold">
        {t('ladderTitle')}
      </h2>
      <p className="mb-4 text-base text-muted">{t('storyLeftS')}</p>
      <Card className="space-y-4 p-4">
        <Rung step={1} tone="grey" label={t('ladderGov')} text={t('ladderGovTx')} />
        <Rung step={2} tone="navy" label={t('ladderSimple')} text={t('ladderSimTx')} />
        <Rung step={3} tone="leaf" label={t('ladderYours')} text={t('ladderYouTx')} big />
      </Card>
    </section>
  );
}
