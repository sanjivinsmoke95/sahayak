'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmptyState, Icon } from '@/components/common';
import { DocumentRow } from '@/components/documents';
import { Button, Skeleton } from '@/components/ui';
import { useDocuments, useProfiles, useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import { buzz, fill } from '@/utils/format';

/** A plain personal document locker — every file the reader has added, newest first. */
export default function DocumentsPage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const { data: documents, isLoading } = useDocuments();
  const { data: profiles } = useProfiles();
  const setDirection = useUiStore((s) => s.setDirection);
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [query, setQuery] = useState('');

  const list = profiles ?? [];
  const selfId = list.find((p) => p.isSelf)?.id ?? '';
  // Only offer a person filter once the reader manages more than themselves.
  const showFilter = list.length > 1;

  const all = documents ?? [];
  const docs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((doc) => {
      if (showFilter && profileFilter !== 'all') {
        const match =
          profileFilter === selfId
            ? doc.profileId === selfId || !doc.profileId
            : doc.profileId === profileFilter;
        if (!match) return false;
      }
      if (q && !`${tr(doc.title)} ${tr(CATS[doc.cat])}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, query, profileFilter, showFilter, selfId, tr]);

  const goUpload = () => {
    setDirection('push');
    router.push('/upload');
  };

  const count = all.length === 1 ? t('docsCount1') : fill(t('docsCount'), { n: all.length });

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('docsTitle')}</h1>
          {!isLoading && all.length > 0 && <p className="mt-1 text-base text-muted">{count}</p>}
        </div>
        {all.length > 0 && (
          <Button size="sm" variant="secondary" onClick={goUpload} className="shrink-0">
            <Icon name="plus" className="h-5 w-5" />
            {t('addDoc')}
          </Button>
        )}
      </header>

      {/* Search — becomes worth its space only once there are a few documents. */}
      {all.length > 3 && (
        <div className="flex items-center gap-2.5 rounded-xl2 border border-navy-200 bg-white px-3.5 py-3 shadow-soft focus-within:border-navy-600">
          <Icon name="search" className="h-5 w-5 shrink-0 text-navy-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('docsSearch')}
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label={t('close')}>
              <Icon name="close" className="h-5 w-5 shrink-0 text-navy-300" />
            </button>
          )}
        </div>
      )}

      {showFilter && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: 'all', label: t('famAll') }, ...list.map((p) => ({
            id: p.id,
            label: p.isSelf ? t('famSelf') : p.name,
          }))].map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={profileFilter === opt.id}
              onClick={() => {
                buzz();
                setProfileFilter(opt.id);
              }}
              className={cn(
                'shrink-0 rounded-full border px-4 py-2 text-base font-semibold transition',
                profileFilter === opt.id
                  ? 'border-navy-600 bg-navy-600 text-white'
                  : 'border-navy-200 bg-white text-navy-700',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : all.length === 0 ? (
        <EmptyState icon="folder" title={t('noDocs')} actionLabel={t('addDoc')} onAction={goUpload} />
      ) : docs.length === 0 ? (
        <div className="rounded-xl2 border border-navy-100 bg-white p-8 text-center shadow-soft">
          <Icon name="search" className="mx-auto h-8 w-8 text-navy-200" />
          <p className="mt-3 text-base text-muted">{t('docsNoMatch')}</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl2 border border-navy-100 bg-white shadow-soft">
          {docs.map((doc, i) => (
            <li key={doc.id} className={i > 0 ? 'border-t border-navy-50' : ''}>
              <DocumentRow document={doc} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
