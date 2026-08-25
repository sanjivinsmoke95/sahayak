'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Skeleton } from '@/components/ui';
import { V2EmptyState } from '@/components/v2';
import { useDocuments, useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import type { SahayakDocument } from '@/types';
import { buzz, daysUntil, formatDate, isValidIsoDate } from '@/utils/format';

type FilterKey = 'all' | 'done' | 'action' | 'expiring' | 'info';

const FILTERS: { key: FilterKey; label: string; dot?: boolean }[] = [
  { key: 'all', label: 'All' },
  { key: 'done', label: 'Explained' },
  { key: 'action', label: 'Pending' },
  { key: 'expiring', label: 'Expiring Soon', dot: true },
  { key: 'info', label: 'Others' },
];

/** A document is "expiring soon" when its deadline is within the next 30 days. */
function isExpiringSoon(doc: SahayakDocument): boolean {
  if (!isValidIsoDate(doc.deadline)) return false;
  const d = daysUntil(doc.deadline as string);
  return d >= 0 && d <= 30;
}

function pillFor(doc: SahayakDocument) {
  if (isExpiringSoon(doc)) return { label: 'Expiring Soon', className: 'bg-[#FFF4E7] text-[#C77A1B]' };
  if (doc.status === 'done') return { label: 'Explained', className: 'bg-[#EAF7F0] text-[#2FA66A]' };
  if (doc.status === 'action') return { label: 'Pending', className: 'bg-[#FFF4E7] text-[#C77A1B]' };
  return { label: 'Info', className: 'bg-[#EEF1F6] text-[#6B7890]' };
}

function daysAgo(iso?: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.round((Date.now() - then) / 86_400_000));
}

export default function V2DocumentsPage() {
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const { data: documents, isLoading } = useDocuments();
  const setDirection = useUiStore((s) => s.setDirection);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const all = documents ?? [];

  const docs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((doc) => {
      if (filter === 'expiring' && !isExpiringSoon(doc)) return false;
      if (filter !== 'all' && filter !== 'expiring' && doc.status !== filter) return false;
      if (q && !`${tr(doc.title)} ${tr(CATS[doc.cat])}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, query, filter, tr]);

  const go = (path: string) => { setDirection('push'); router.push(path); };

  const dateLabel = (iso?: string | null) => {
    const ago = daysAgo(iso);
    if (ago === null) return '';
    if (ago === 0) return 'today';
    if (ago <= 14) return `${ago} day${ago === 1 ? '' : 's'} ago`;
    return formatDate(iso!, language);
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 space-y-4">
        {/* Search */}
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full rounded-full border border-[#E5E7EB] bg-white py-3.5 pl-12 pr-12 text-base text-[#101828] placeholder:text-[#98A2B3] outline-none focus:border-[#173A78] focus:ring-2 focus:ring-[#EAF1FF]"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7890]">
            <Icon name="sliders" className="h-5 w-5" />
          </span>
        </div>

        {/* Status chips */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => { buzz(); setFilter(f.key); }}
              className={cn(
                'relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
                filter === f.key
                  ? 'bg-[#173A78] text-white'
                  : 'bg-white text-[#101828] ring-1 ring-[#E5E7EB]',
              )}
            >
              {f.label}
              {f.dot && filter !== f.key && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#F6A23A]" />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-[18px]" />)}
          </div>
        ) : all.length === 0 ? (
          <V2EmptyState icon="folder" title={t('noDocs')} actionLabel={t('addDoc')} onAction={() => go('/v2/upload')} />
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center rounded-[18px] border border-[#E5E7EB] bg-white p-8 text-center">
            <Icon name="search" className="h-8 w-8 text-[#C6D0E4]" />
            <p className="mt-3 text-sm text-[#6B7890]">{t('docsNoMatch')}</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {docs.map((doc) => {
              const pill = pillFor(doc);
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => go(`/v2/documents/${doc.id}`)}
                    className="flex w-full items-center gap-3 rounded-[18px] border border-[#EAF1FF] bg-white p-3.5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F5F8FF]"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#EAF1FF] text-[#173A78]">
                      <Icon name="doc" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-[#101828]">{tr(doc.title)}</span>
                      <span className="mt-1 flex items-center gap-2">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', pill.className)}>
                          {pill.label}
                        </span>
                        <span className="text-xs text-[#6B7890]">· {dateLabel(doc.received)}</span>
                      </span>
                    </span>
                    <Icon name="right" className="h-5 w-5 shrink-0 text-[#C6D0E4]" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Tip card */}
        {all.length > 0 && (
          <button
            type="button"
            onClick={() => go('/v2/upload')}
            className="flex w-full items-center gap-3 rounded-[18px] bg-[#EAF7F0] p-4 text-left active:opacity-90"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-white text-[#2FA66A]">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-[#101828]">Keep your documents updated</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-[#6B7890]">
                Updated documents help you get government services faster.
              </span>
            </span>
            <Icon name="right" className="h-5 w-5 shrink-0 text-[#2FA66A]" />
          </button>
        )}
      </div>

      {/* Upload Document button */}
      <button
        type="button"
        onClick={() => go('/v2/upload')}
        className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-[16px] px-4 py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(23,58,120,0.22)] active:translate-y-px"
        style={{ backgroundColor: '#173A78' }}
      >
        <Icon name="upload" className="h-5 w-5" />
        Upload Document
      </button>
    </div>
  );
}
