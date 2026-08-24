'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Skeleton } from '@/components/ui';
import { V2Button, V2DocumentRow, V2EmptyState, V2Input } from '@/components/v2';
import { useDocuments, useProfiles, useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import type { DocumentCategory } from '@/types';
import { buzz } from '@/utils/format';

const FILTER_CATS: { key: 'all' | DocumentCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'identity', label: 'Identity' },
  { key: 'tax', label: 'Income' },
  { key: 'education', label: 'Education' },
  { key: 'other', label: 'Other' },
];

function groupByMonth(dates: { received: string }[]) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const groups: Record<string, typeof dates> = {};
  for (const item of dates) {
    const month = item.received?.slice(0, 7) || 'unknown';
    const label = month === thisMonth ? 'This month'
      : month === `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}` ? 'Last month'
      : month;
    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  }
  return groups;
}

export default function V2DocumentsPage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const { data: documents, isLoading } = useDocuments();
  const setDirection = useUiStore((s) => s.setDirection);
  const [catFilter, setCatFilter] = useState<'all' | DocumentCategory>('all');
  const [query, setQuery] = useState('');

  const all = documents ?? [];

  const docs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((doc) => {
      if (catFilter !== 'all' && doc.cat !== catFilter) return false;
      if (q && !`${tr(doc.title)} ${tr(CATS[doc.cat])}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, query, catFilter, tr]);

  const grouped = useMemo(() => groupByMonth(docs as any), [docs]);
  const goUpload = () => { setDirection('push'); router.push('/v2/upload'); };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#D6DDE8]" />
        <V2Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('docsSearch')}
          className="pl-11 pr-11"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
          onClick={() => setCatFilter('all')}
        >
          <Icon name="sliders" className="h-5 w-5" />
        </button>
      </div>

      {/* Category chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTER_CATS.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={catFilter === c.key}
            onClick={() => { buzz(); setCatFilter(c.key); }}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition',
              catFilter === c.key
                ? 'border-[#102D63] bg-[#102D63] text-white'
                : 'border-[#D6DDE8] bg-white text-[#101828]',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Document list grouped by time */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-[16px]" />)}
        </div>
      ) : all.length === 0 ? (
        <V2EmptyState icon="folder" title={t('noDocs')} actionLabel={t('addDoc')} onAction={goUpload} />
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center rounded-[16px] border border-[#D6DDE8] bg-white p-8 text-center">
          <Icon name="search" className="h-8 w-8 text-[#D6DDE8]" />
          <p className="mt-3 text-sm text-[#667085]">{t('docsNoMatch')}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([label, groupDocs]) => (
          <section key={label}>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#667085]">{label}</h3>
            <div className="overflow-hidden rounded-[16px] border border-[#D6DDE8] bg-white shadow-[0_1px_4px_rgba(25,18,14,0.06)]">
              {(groupDocs as any[]).map((doc, i) => (
                <div key={doc.id} className={i > 0 ? 'border-t border-[#E8EDF5]' : ''}>
                  <V2DocumentRow document={doc} />
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
