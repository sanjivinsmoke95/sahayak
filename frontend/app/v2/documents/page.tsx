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
import type { DocumentStatus } from '@/types';
import { buzz, formatDate } from '@/utils/format';

type FilterKey = 'all' | DocumentStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'done', label: 'Explained' },
  { key: 'action', label: 'Pending' },
  { key: 'info', label: 'Others' },
];

// Warm palette sampled from the reference slide, rotated for green/orange/blue
// variety across the list (matching the mockup regardless of category data).
const TINTS = [
  'bg-[#D3E9D4] text-[#3E8E5A]', // green
  'bg-[#FFE3C5] text-[#EA9A3E]', // orange
  'bg-[#E7ECFB] text-[#01226F]', // blue
];

const STATUS_PILL: Record<DocumentStatus, { label: string; className: string }> = {
  done: { label: 'Explained', className: 'bg-[#D3E9D4] text-[#3E8E5A]' },
  action: { label: 'Pending', className: 'bg-[#FFE3C5] text-[#EA9A3E]' },
  info: { label: 'Info', className: 'bg-[#EDEEF1] text-[#667085]' },
};

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
      if (filter !== 'all' && doc.status !== filter) return false;
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
            className="w-full rounded-full border border-[#ECE4D8] bg-white py-3.5 pl-12 pr-12 text-base text-[#101828] placeholder:text-[#98A2B3] outline-none focus:border-[#102D63] focus:ring-2 focus:ring-[#EAF1FF]"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#667085]">
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
                'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
                filter === f.key
                  ? 'bg-[#01226F] text-white'
                  : 'bg-white text-[#101828] ring-1 ring-[#ECE4D8]',
              )}
            >
              {f.label}
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
          <div className="flex flex-col items-center rounded-[18px] border border-[#F0E9DF] bg-white p-8 text-center">
            <Icon name="search" className="h-8 w-8 text-[#D6DDE8]" />
            <p className="mt-3 text-sm text-[#667085]">{t('docsNoMatch')}</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {docs.map((doc, i) => {
              const pill = STATUS_PILL[doc.status];
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => go(`/v2/documents/${doc.id}`)}
                    className="flex w-full items-center gap-3 rounded-[18px] border border-[#F0E9DF] bg-white p-3.5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#FBF7F1]"
                  >
                    <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-[12px]', TINTS[i % 3])}>
                      <Icon name="doc" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-[#101828]">{tr(doc.title)}</span>
                      <span className="mt-1 inline-flex">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', pill.className)}>
                          {pill.label}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-[#667085]">{dateLabel(doc.received)}</span>
                    <Icon name="right" className="h-5 w-5 shrink-0 text-[#D6DDE8]" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Upload Document button */}
      <button
        type="button"
        onClick={() => go('/v2/upload')}
        className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-[16px] bg-[#01226F] px-4 py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(16,40,99,0.22)] active:translate-y-px"
      >
        <Icon name="upload" className="h-5 w-5" />
        Upload Document
      </button>
    </div>
  );
}
