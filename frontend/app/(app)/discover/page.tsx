'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Badge, Skeleton } from '@/components/ui';
import { useDiscovery, useSchemeMatches, useTranslation } from '@/hooks';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { useUiStore } from '@/store';
import { fill } from '@/utils/format';

/** Services the reader may be able to use, ranked by how many papers they have. */
export default function DiscoverPage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data, isLoading } = useDiscovery();
  const { data: matchData } = useSchemeMatches();

  const services = data?.services ?? [];
  const schemeMatches = matchData?.results ?? [];

  const openScheme = (id: string) => {
    setDirection('push');
    router.push(`/schemes/${id}`);
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{t('discTitle')}</h1>
        <p className="mt-2 text-lg leading-relaxed text-muted">{t('discSub')}</p>
      </header>

      <div className="flex items-start gap-2 rounded-xl bg-amberx-50 p-3 text-sm leading-relaxed text-amberx-700">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t('provNote')}</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-xl2 border border-navy-100 bg-white p-5 text-lg text-muted shadow-soft">
          {t('discNone')}
        </div>
      ) : (
        <div className="space-y-2.5">
          {services.map((s) => {
            const svc = GOV_SERVICES.find((g) => g.id === s.serviceId);
            return (
              <button
                key={s.serviceId}
                type="button"
                onClick={() => {
                  setDirection('push');
                  router.push(`/services/${s.serviceId}`);
                }}
                className="flex w-full items-center gap-3.5 rounded-xl2 border border-navy-100 bg-white p-4 text-left shadow-soft active:bg-navy-50"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy-50 text-navy-600">
                  <Icon name={svc?.icon ?? 'tasks'} className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold leading-snug">
                    {svc ? tr(svc.title) : s.serviceId}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {fill(t('discPapers'), { n: s.satisfied, m: s.total })}
                  </span>
                </span>
                {s.status === 'ready' ? (
                  <Badge tone="leaf">{t('discReadyTag')}</Badge>
                ) : (
                  <Icon name="right" className="h-5 w-5 shrink-0 text-navy-300" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Schemes matched from the myScheme reference dataset. */}
      {schemeMatches.length > 0 && (
        <section aria-labelledby="scheme-matches">
          <h2 id="scheme-matches" className="mb-1 text-lg font-bold">
            {t('schMatchesTitle')}
          </h2>
          <button
            type="button"
            onClick={() => {
              setDirection('push');
              router.push('/schemes');
            }}
            className="mb-2.5 inline-flex items-center gap-1 text-sm font-semibold text-navy-600"
          >
            {t('schBrowse')}
            <Icon name="right" className="h-4 w-4" />
          </button>
          <ul className="space-y-2">
            {schemeMatches.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => openScheme(m.id)}
                  className="flex w-full items-center gap-3 rounded-xl2 border border-navy-100 bg-white p-3.5 text-left shadow-soft active:bg-navy-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold leading-snug">{m.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {m.category} · {fill(t('schMatchN'), { n: m.satisfied, m: m.total })}
                    </span>
                  </span>
                  <Icon name="right" className="h-5 w-5 shrink-0 text-navy-300" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
