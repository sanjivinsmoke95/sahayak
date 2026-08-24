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
import { buzz, fill } from '@/utils/format';

export default function V2DocumentsPage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const { data: documents, isLoading } = useDocuments();
  const { data: profiles } = useProfiles();
  const setDirection = useUiStore((s) => s.setDirection);
  const [profileFilter, setProfileFilter] = useState('all');
  const [query, setQuery] = useState('');

  const list = profiles ?? [];
  const selfId = list.find((p) => p.isSelf)?.id ?? '';
  const showFilter = list.length > 1;
  const all = documents ?? [];

  const docs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((doc) => {
      if (showFilter && profileFilter !== 'all') {
        const match = profileFilter === selfId
          ? doc.profileId === selfId || !doc.profileId
          : doc.profileId === profileFilter;
        if (!match) return false;
      }
      if (q && !`${tr(doc.title)} ${tr(CATS[doc.cat])}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, query, profileFilter, showFilter, selfId, tr]);

  const goUpload = () => { setDirection('push'); router.push('/v2/upload'); };
  const count = all.length === 1 ? t('docsCount1') : fill(t('docsCount'), { n: all.length });

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="v2-heading text-2xl font-bold text-[#19120E]">{t('docsTitle')}</h1>
          {!isLoading && all.length > 0 && <p className="mt-1 text-sm text-[#7A6E68]">{count}</p>}
        </div>
        {all.length > 0 && (
          <V2Button size="sm" variant="secondary" onClick={goUpload}>
            <Icon name="plus" className="h-4 w-4" />
            {t('addDoc')}
          </V2Button>
        )}
      </header>

      {all.length > 3 && (
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#D8D0C7]" />
          <V2Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('docsSearch')}
            className="pl-11"
          />
        </div>
      )}

      {showFilter && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: 'all', label: t('famAll') }, ...list.map((p) => ({
            id: p.id, label: p.isSelf ? t('famSelf') : p.name,
          }))].map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={profileFilter === opt.id}
              onClick={() => { buzz(); setProfileFilter(opt.id); }}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition',
                profileFilter === opt.id
                  ? 'border-[#0C6E6B] bg-[#0C6E6B] text-white'
                  : 'border-[#D8D0C7] bg-white text-[#19120E]',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-[16px]" />)}
        </div>
      ) : all.length === 0 ? (
        <V2EmptyState icon="folder" title={t('noDocs')} actionLabel={t('addDoc')} onAction={goUpload} />
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center rounded-[16px] border border-[#D8D0C7] bg-white p-8 text-center">
          <Icon name="search" className="h-8 w-8 text-[#D8D0C7]" />
          <p className="mt-3 text-base text-[#7A6E68]">{t('docsNoMatch')}</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-[16px] border border-[#D8D0C7] bg-white shadow-[0_1px_4px_rgba(25,18,14,0.06),0_2px_12px_rgba(25,18,14,0.04)]">
          {docs.map((doc, i) => (
            <li key={doc.id} className={i > 0 ? 'border-t border-[#EDE9E3]' : ''}>
              <V2DocumentRow document={doc} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
