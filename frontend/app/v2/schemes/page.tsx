'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Skeleton } from '@/components/ui';
import { V2Badge, V2Card, V2Input } from '@/components/v2';
import { useSchemeCategories, useSchemeMatches, useSchemeSearch, useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import { fill } from '@/utils/format';

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

  return (
    <div className="space-y-4">
      <header>
        <h1 className="v2-heading text-2xl font-bold text-[#19120E]">{t('schBrowse')}</h1>
        <p className="mt-1 text-sm text-[#7A6E68]">{t('schBrowseSub')}</p>
      </header>

      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#D8D0C7]" />
        <V2Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('schSearchPh')} className="pl-11" />
      </div>

      {categories && categories.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            aria-pressed={category === ''}
            onClick={() => setCategory('')}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition',
              category === '' ? 'border-[#0C6E6B] bg-[#0C6E6B] text-white' : 'border-[#D8D0C7] bg-white text-[#19120E]',
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
                category === c ? 'border-[#0C6E6B] bg-[#0C6E6B] text-white' : 'border-[#D8D0C7] bg-white text-[#19120E]',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Recommended */}
      {browsing && matches.length > 0 && (
        <section>
          <h2 className="v2-heading mb-2 text-lg font-bold text-[#19120E]">{t('schRecommended')}</h2>
          <div className="space-y-2.5">
            {matches.slice(0, 4).map((m) => (
              <V2Card key={m.id} onClick={() => open(m.id)} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-base font-bold text-[#19120E]">{m.name}</p>
                  <V2Badge tone="teal">{m.satisfied}/{m.total}</V2Badge>
                </div>
                <p className="mt-1 text-sm text-[#7A6E68]">{m.benefit}</p>
                {m.missingTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.missingTags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-[#FDF3E1] px-2 py-0.5 text-xs font-medium text-[#C97B1A]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </V2Card>
            ))}
          </div>
        </section>
      )}

      {/* Browse / search results */}
      <section>
        {!browsing && (
          <p className="mb-2 text-sm text-[#7A6E68]">{fill(t('schResults'), { n: data?.total ?? 0 })}</p>
        )}
        {browsing && browseResults.length > 0 && (
          <h2 className="v2-heading mb-2 text-lg font-bold text-[#19120E]">{t('schAll')}</h2>
        )}
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-[16px]" />)}
          </div>
        ) : results.length === 0 ? (
          <p className="rounded-[16px] border border-[#D8D0C7] bg-white p-4 text-base text-[#7A6E68]">
            {t('schNoResults')}
          </p>
        ) : (
          <ul className="space-y-2">
            {browseResults.map((s) => (
              <li key={s.id}>
                <V2Card onClick={() => open(s.id)} className="flex items-start gap-3 p-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold leading-snug text-[#19120E]">{s.name}</span>
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
    </div>
  );
}
