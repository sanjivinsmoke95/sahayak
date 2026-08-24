'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Skeleton } from '@/components/ui';
import { V2EmptyState } from '@/components/v2';
import { useDocuments, useSchemeMatches, useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import { daysUntil, isValidIsoDate } from '@/utils/format';

type Tone = 'orange' | 'green' | 'red';
type Bucket = 'upcoming' | 'resolved';

interface AlertItem {
  id: string;
  bucket: Bucket;
  tone: Tone;
  icon: string;
  title: string;
  sub: string;
  href?: string;
  sort: number;
}

const TONE: Record<Tone, { card: string; icon: string; sub: string }> = {
  orange: { card: 'bg-[#FFF3E3]', icon: 'text-[#F4A340]', sub: 'text-[#B5760F]' },
  green: { card: 'bg-[#EAF7EF]', icon: 'text-[#2E9B67]', sub: 'text-[#2E9B67]' },
  red: { card: 'bg-[#FDE8EA]', icon: 'text-[#DC3545]', sub: 'text-[#DC3545]' },
};

const TABS: { key: 'all' | Bucket; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'resolved', label: 'Resolved' },
];

export default function V2AlertsPage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: documents, isLoading } = useDocuments();
  const { data: matchData } = useSchemeMatches();
  const [tab, setTab] = useState<'all' | Bucket>('all');

  const alerts = useMemo<AlertItem[]>(() => {
    const list: AlertItem[] = [];

    for (const doc of documents ?? []) {
      const deadline = isValidIsoDate(doc.deadline) ? doc.deadline : null;
      if (!deadline) continue;
      const days = daysUntil(deadline);
      if (days < 0) {
        list.push({
          id: `exp-${doc.id}`, bucket: 'upcoming', tone: 'red', icon: 'calendar',
          title: tr(doc.title), sub: `Overdue by ${-days} ${-days === 1 ? 'day' : 'days'}`,
          href: `/v2/documents/${doc.id}`, sort: days,
        });
      } else if (days <= 90) {
        list.push({
          id: `due-${doc.id}`, bucket: 'upcoming', tone: 'orange', icon: 'calendar',
          title: tr(doc.title), sub: `Due in ${days} ${days === 1 ? 'day' : 'days'}`,
          href: `/v2/documents/${doc.id}`, sort: days,
        });
      }
    }

    const ready = (matchData?.results ?? []).filter((m) => m.total > 0 && m.satisfied === m.total);
    for (const m of ready.slice(0, 4)) {
      list.push({
        id: `scheme-${m.id}`, bucket: 'resolved', tone: 'green', icon: 'check',
        title: m.name, sub: 'Documents ready', href: `/v2/schemes/${m.id}`, sort: 1000,
      });
    }

    return list.sort((a, b) => a.sort - b.sort);
  }, [documents, matchData, tr]);

  const filtered = tab === 'all' ? alerts : alerts.filter((a) => a.bucket === tab);
  const open = (href?: string) => { if (!href) return; setDirection('push'); router.push(href); };

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2.5">
        {TABS.map((tb) => {
          const active = tab === tb.key;
          return (
            <button
              key={tb.key}
              type="button"
              aria-pressed={active}
              onClick={() => setTab(tb.key)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                active ? 'bg-[#102D63] text-white' : 'bg-white text-[#667085] ring-1 ring-[#D9E2F0]',
              )}
            >
              {tb.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-[18px]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <V2EmptyState icon="check" title={t('alertsEmpty')} description={t('alertsEmptySub')} />
      ) : (
        <>
          <ul className="space-y-2.5">
            {filtered.map((a) => {
              const s = TONE[a.tone];
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => open(a.href)}
                    className={cn('flex w-full items-center gap-3 rounded-[18px] p-4 text-left transition active:opacity-90', s.card)}
                  >
                    <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-white', s.icon)}>
                      <Icon name={a.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-[#101828]">{a.title}</span>
                      <span className={cn('mt-0.5 block text-sm font-semibold', s.sub)}>{a.sub}</span>
                    </span>
                    <Icon name="right" className="h-5 w-5 shrink-0 text-[#98A2B3]" />
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => { setDirection('push'); router.push('/v2/documents'); }}
            className="mt-2 flex w-full items-center justify-center rounded-full border border-[#D9E2F0] bg-white px-4 py-3.5 text-base font-bold text-[#102D63] active:bg-[#F8FAFC]"
          >
            View All Alerts
          </button>
        </>
      )}
    </div>
  );
}
