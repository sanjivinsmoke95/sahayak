'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Skeleton } from '@/components/ui';
import { V2Badge, V2Card, V2Input, V2SchemeMatchCard } from '@/components/v2';
import { useSchemeCategories, useSchemeMatches, useSchemeSearch, useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';

const CAT_ICONS: Record<string, string> = {
  Education: 'doc',
  Agriculture: 'globe',
  Women: 'user',
  'Senior Citizens': 'user',
  Banking: 'tasks',
  Health: 'help',
  'Business & Entrepreneurship': 'spark',
};

export default function V2SchemesPage() {
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
  const matchIds = new Set(matches.slice(0, 4).map((m) => m.id));
  const browseResults = browsing ? results.filter((s) => !matchIds.has(s.id)) : results;

  const open = (id: string) => { setDirection('push'); router.push(`/v2/schemes/${id}`); };

  const topCategories = (categories ?? []).slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#D8D0C7]" />
        <V2Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('schSearchPh')} className="pl-11 pr-11" />
        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6E68]">
          <Icon name="sliders" className="h-5 w-5" />
        </button>
      </div>

      {/* Best matches — with progress bars */}
      {browsing && matches.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="v2-heading text-lg font-bold text-[#19120E]">Best matches for you</h2>
            <button
              type="button"
              onClick={() => { /* show all matches */ }}
              className="text-sm font-semibold text-[#0C6E6B]"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="space-y-2.5">
            {matches.slice(0, 3).map((m) => (
              <V2SchemeMatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by category — icon grid */}
      {browsing && topCategories.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="v2-heading text-lg font-bold text-[#19120E]">Browse by category</h2>
            <button
              type="button"
              onClick={() => {}}
              className="text-sm font-semibold text-[#0C6E6B]"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {topCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className="flex flex-col items-center gap-2 rounded-[16px] border border-[#D8D0C7] bg-white p-3 active:bg-[#F6F3EF]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E1F0EF] text-[#0C6E6B]">
                  <Icon name={CAT_ICONS[cat] || 'globe'} className="h-5 w-5" />
                </span>
                <span className="text-center text-xs font-semibold leading-tight text-[#19120E]">{cat}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Search results or browsing */}
      {!browsing && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            {category && (
              <button
                type="button"
                onClick={() => setCategory('')}
                className="flex items-center gap-1 text-sm font-semibold text-[#0C6E6B]"
              >
                <Icon name="left" className="h-4 w-4" />
                All categories
              </button>
            )}
            <p className="text-sm text-[#7A6E68]">{data?.total ?? 0} schemes</p>
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-[16px]" />)}
            </div>
          ) : results.length === 0 ? (
            <p className="rounded-[16px] border border-[#D8D0C7] bg-white p-4 text-sm text-[#7A6E68]">
              {t('schNoResults')}
            </p>
          ) : (
            <ul className="space-y-2">
              {results.map((s) => (
                <li key={s.id}>
                  <V2Card onClick={() => open(s.id)} className="flex items-start gap-3 p-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold leading-snug text-[#19120E]">{s.name}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5">
                        <V2Badge tone="teal">{s.category}</V2Badge>
                        <V2Badge tone="grey">{s.level === 'Central' ? t('schCentral') : t('schState')}</V2Badge>
                      </span>
                    </span>
                    <Icon name="right" className="mt-1 h-5 w-5 shrink-0 text-[#D8D0C7]" />
                  </V2Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
