'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { SchemeMatchCard } from '@/components/schemes';
import { Badge, Input, Skeleton } from '@/components/ui';
import {
  useSchemeCategories,
  useSchemeMatches,
  useSchemeSearch,
  useTranslation,
} from '@/hooks';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import { fill } from '@/utils/format';

export default function SchemesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  const { data: categories } = useSchemeCategories();
  const { data: matchData } = useSchemeMatches();
  const { data, isLoading } = useSchemeSearch({ q, category: category || undefined, limit: 25 });

  const results = data?.results ?? [];
  const matches = matchData?.results ?? [];
  const browsing = !q.trim() && !category;
  const open = (id: string) => {
    setDirection('push');
    router.push(`/schemes/${id}`);
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">{t('schBrowse')}</h1>
        <p className="mt-1 text-base text-muted">{t('schBrowseSub')}</p>
      </header>

      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-300" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('schSearchPh')}
          aria-label={t('schSearchPh')}
          className="pl-11"
        />
      </div>

      {/* Category chips. */}
      {categories && categories.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            aria-pressed={category === ''}
            onClick={() => setCategory('')}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition',
              category === '' ? 'border-navy-600 bg-navy-600 text-white' : 'border-navy-200 bg-white text-navy-700',
            )}
          >
            {t('schAll')}
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(category === c ? '' : c)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition',
                category === c ? 'border-navy-600 bg-navy-600 text-white' : 'border-navy-200 bg-white text-navy-700',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Recommended for you — grounded to the reader's documents. */}
      {browsing && matches.length > 0 && (
        <section aria-labelledby="recommended">
          <h2 id="recommended" className="mb-2 text-lg font-bold">
            {t('schRecommended')}
          </h2>
          <div className="space-y-2.5">
            {matches.slice(0, 4).map((m) => (
              <SchemeMatchCard key={m.id} scheme={m} />
            ))}
          </div>
        </section>
      )}

      {/* Browse / search results. */}
      <section>
        {!browsing && (
          <p className="mb-2 text-sm text-muted">{fill(t('schResults'), { n: data?.total ?? 0 })}</p>
        )}
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <p className="rounded-xl2 border border-navy-100 bg-white p-4 text-base text-muted">
            {t('schNoResults')}
          </p>
        ) : (
          <ul className="space-y-2">
            {results.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => open(s.id)}
                  className="flex w-full items-start gap-3 rounded-xl2 border border-navy-100 bg-white p-3.5 text-left shadow-soft active:bg-navy-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold leading-snug">{s.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge tone="navy">{s.category}</Badge>
                      <Badge tone="grey">{s.level === 'Central' ? t('schCentral') : t('schState')}</Badge>
                    </span>
                  </span>
                  <Icon name="right" className="mt-1 h-5 w-5 shrink-0 text-navy-300" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
