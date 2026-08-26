'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/common';
import { V2Badge } from '@/components/v2';
import { useDocuments, useSchemeSearch, useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { useUiStore } from '@/store';

function SearchScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, tr } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const [query, setQuery] = useState(params.get('q') ?? '');

  const { data: documents } = useDocuments();
  const { data: schemeData, isLoading: schemesLoading } = useSchemeSearch({ q: query, limit: 20 });

  const q = query.trim().toLowerCase();
  const docs = useMemo(() => {
    if (!q) return [];
    return (documents ?? []).filter((d) =>
      `${tr(d.title)} ${tr(CATS[d.cat])}`.toLowerCase().includes(q),
    );
  }, [documents, q, tr]);

  const schemes = q ? (schemeData?.results ?? []) : [];
  const go = (path: string) => { setDirection('push'); router.push(path); };
  const nothing = q && docs.length === 0 && schemes.length === 0 && !schemesLoading;

  return (
    <div className="space-y-5">
      {/* Search input */}
      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98A2B3]" />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('askAnything')}
          className="w-full rounded-full border border-[#E5E7EB] bg-white py-3.5 pl-12 pr-4 text-base text-[#101828] placeholder:text-[#98A2B3] outline-none focus:border-[#173A78] focus:ring-2 focus:ring-[#EAF1FF]"
        />
      </div>

      {!q && (
        <p className="pt-6 text-center text-sm text-[#667085]">{t('searchHint')}</p>
      )}

      {nothing && (
        <div className="flex flex-col items-center rounded-[18px] border border-[#E5E7EB] bg-white p-8 text-center">
          <Icon name="search" className="h-8 w-8 text-[#C6D0E4]" />
          <p className="mt-3 text-sm text-[#667085]">{t('searchNone')}</p>
        </div>
      )}

      {/* Documents */}
      {docs.length > 0 && (
        <section>
          <h2 className="v2-heading mb-2 text-sm font-bold uppercase tracking-wider text-[#667085]">{t('shortDocs')}</h2>
          <ul className="space-y-2.5">
            {docs.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => go(`/v2/documents/${doc.id}`)}
                  className="flex w-full items-center gap-3 rounded-[18px] border border-[#EAF1FF] bg-white p-3.5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F5F8FF]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#EAF1FF] text-[#173A78]">
                    <Icon name="doc" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] font-bold text-[#101828]">{tr(doc.title)}</span>
                  <Icon name="right" className="h-5 w-5 shrink-0 text-[#C6D0E4]" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Schemes */}
      {schemes.length > 0 && (
        <section>
          <h2 className="v2-heading mb-2 text-sm font-bold uppercase tracking-wider text-[#667085]">{t('tabSchemes')}</h2>
          <ul className="space-y-2.5">
            {schemes.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(`/v2/schemes/${s.id}`)}
                  className="flex w-full items-start gap-3 rounded-[18px] border border-[#EAF1FF] bg-white p-3.5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F5F8FF]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#EAF7F0] text-[#2FA66A]">
                    <Icon name="spark" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold leading-snug text-[#101828]">{s.name}</span>
                    <span className="mt-1 inline-flex">
                      <V2Badge tone="teal">{s.category}</V2Badge>
                    </span>
                  </span>
                  <Icon name="right" className="mt-1 h-5 w-5 shrink-0 text-[#C6D0E4]" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function V2SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchScreen />
    </Suspense>
  );
}
