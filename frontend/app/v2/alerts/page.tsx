'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Skeleton } from '@/components/ui';
import { V2EmptyState } from '@/components/v2';
import { useConsistency, useDocuments, useSchemeMatches, useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import { daysUntil, isValidIsoDate } from '@/utils/format';

type AlertTone = 'danger' | 'warn' | 'good' | 'info';

interface AlertItem {
  id: string;
  tone: AlertTone;
  icon: string;
  title: string;
  body: string;
  href?: string;
}

const TONE_STYLES: Record<AlertTone, { icon: string; ring: string; text: string }> = {
  danger: { icon: 'bg-[#FDE8EA] text-[#DC3545]', ring: 'border-[#F5C6CB]', text: 'text-[#DC3545]' },
  warn: { icon: 'bg-[#FFF3E3] text-[#F4A340]', ring: 'border-[#F7E0BE]', text: 'text-[#B5760F]' },
  good: { icon: 'bg-[#EAF7EF] text-[#2E9B67]', ring: 'border-[#BFE6CF]', text: 'text-[#2E9B67]' },
  info: { icon: 'bg-[#EAF1FF] text-[#102D63]', ring: 'border-[#CFDCF5]', text: 'text-[#102D63]' },
};

export default function V2AlertsPage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: documents, isLoading } = useDocuments();
  const { data: consistency } = useConsistency();
  const { data: matchData } = useSchemeMatches();

  const alerts = useMemo<AlertItem[]>(() => {
    const list: AlertItem[] = [];
    const docs = documents ?? [];

    for (const doc of docs) {
      const deadline = isValidIsoDate(doc.deadline) ? doc.deadline : null;
      if (!deadline) continue;
      const days = daysUntil(deadline);
      if (days < 0) {
        list.push({
          id: `exp-${doc.id}`,
          tone: 'danger',
          icon: 'alert',
          title: t('alertExpiredT'),
          body: `${tr(doc.title)} · ${-days} ${-days === 1 ? 'day' : 'days'} ago`,
          href: `/v2/documents/${doc.id}`,
        });
      } else if (days <= 45) {
        list.push({
          id: `expiring-${doc.id}`,
          tone: 'warn',
          icon: 'clock',
          title: t('alertExpiringT'),
          body: `${tr(doc.title)} · in ${days} ${days === 1 ? 'day' : 'days'}`,
          href: `/v2/documents/${doc.id}`,
        });
      }
    }

    for (const [i, issue] of (consistency?.issues ?? []).entries()) {
      if (issue.severity === 'info') continue;
      list.push({
        id: `mismatch-${i}`,
        tone: 'warn',
        icon: 'info',
        title: t('alertMismatchT'),
        body: `${issue.field}: ${issue.values.join(' / ')}`,
      });
    }

    const readyMatches = (matchData?.results ?? []).filter((m) => m.total > 0 && m.satisfied === m.total);
    for (const m of readyMatches.slice(0, 3)) {
      list.push({
        id: `scheme-${m.id}`,
        tone: 'good',
        icon: 'spark',
        title: t('alertSchemeT'),
        body: m.name,
        href: `/v2/schemes/${m.id}`,
      });
    }

    const order: Record<AlertTone, number> = { danger: 0, warn: 1, good: 2, info: 3 };
    return list.sort((a, b) => order[a.tone] - order[b.tone]);
  }, [documents, consistency, matchData, t, tr]);

  const open = (href?: string) => {
    if (!href) return;
    setDirection('push');
    router.push(href);
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="v2-heading text-2xl font-extrabold text-[#101828]">{t('alertsTitle')}</h1>
        <p className="mt-1 text-sm text-[#667085]">{t('alertsSub')}</p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-[18px]" />)}
        </div>
      ) : alerts.length === 0 ? (
        <V2EmptyState icon="check" title={t('alertsEmpty')} description={t('alertsEmptySub')} />
      ) : (
        <ul className="space-y-2.5">
          {alerts.map((a) => {
            const s = TONE_STYLES[a.tone];
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => open(a.href)}
                  disabled={!a.href}
                  className={`flex w-full items-start gap-3 rounded-[18px] border ${s.ring} bg-white p-4 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] transition ${a.href ? 'active:bg-[#F8FAFC]' : 'cursor-default'}`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-[12px] ${s.icon}`}>
                    <Icon name={a.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-bold ${s.text}`}>{a.title}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-[#101828]">{a.body}</span>
                  </span>
                  {a.href && <Icon name="right" className="mt-1 h-5 w-5 shrink-0 text-[#D6DDE8]" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
