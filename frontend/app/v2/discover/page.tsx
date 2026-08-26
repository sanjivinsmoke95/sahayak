'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Badge, Skeleton } from '@/components/ui';
import { useDiscovery, useSchemeMatches, useTranslation } from '@/hooks';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { useUiStore } from '@/store';
import { fill } from '@/utils/format';

/** Services and schemes the reader may be able to use, ranked by their papers. */
export default function V2DiscoverPage() {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data, isLoading } = useDiscovery();
  const { data: matchData } = useSchemeMatches();

  const services = data?.services ?? [];
  const schemeMatches = matchData?.results ?? [];

  const go = (path: string) => { setDirection('push'); router.push(path); };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="v2-heading text-2xl font-bold text-[#101828]">{t('discTitle')}</h1>
        <p className="mt-2 text-base leading-relaxed text-[#667085]">{t('discSub')}</p>
      </header>

      <div className="flex items-start gap-2 rounded-[14px] bg-[#FFF4E7] p-3 text-sm leading-relaxed text-[#C77A1B]">
        <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t('provNote')}</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-[18px]" />
          <Skeleton className="h-20 w-full rounded-[18px]" />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-[18px] border border-[#EAF1FF] bg-white p-5 text-base text-[#667085] shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
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
                onClick={() => go(`/v2/services/${s.serviceId}`)}
                className="flex w-full items-center gap-3.5 rounded-[18px] border border-[#EAF1FF] bg-white p-4 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F5F8FF]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#EAF1FF] text-[#173A78]">
                  <Icon name={svc?.icon ?? 'tasks'} className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold leading-snug text-[#101828]">
                    {svc ? tr(svc.title) : s.serviceId}
                  </span>
                  <span className="mt-0.5 block text-sm text-[#667085]">
                    {fill(t('discPapers'), { n: s.satisfied, m: s.total })}
                  </span>
                </span>
                {s.status === 'ready'
                  ? <Badge tone="leaf">{t('discReadyTag')}</Badge>
                  : <Icon name="right" className="h-5 w-5 shrink-0 text-[#C6D0E4]" />}
              </button>
            );
          })}
        </div>
      )}

      {schemeMatches.length > 0 && (
        <section aria-labelledby="scheme-matches">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="scheme-matches" className="v2-heading text-lg font-bold text-[#101828]">
              {t('schMatchesTitle')}
            </h2>
            <button
              type="button"
              onClick={() => go('/v2/schemes')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#173A78]"
            >
              {t('schBrowse')}
              <Icon name="right" className="h-4 w-4" />
            </button>
          </div>
          <ul className="space-y-2">
            {schemeMatches.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => go(`/v2/schemes/${m.id}`)}
                  className="flex w-full items-center gap-3 rounded-[18px] border border-[#EAF1FF] bg-white p-3.5 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F5F8FF]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold leading-snug text-[#101828]">{m.name}</span>
                    <span className="mt-0.5 block text-sm text-[#667085]">
                      {m.category} · {fill(t('schMatchN'), { n: m.satisfied, m: m.total })}
                    </span>
                  </span>
                  <Icon name="right" className="h-5 w-5 shrink-0 text-[#C6D0E4]" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
