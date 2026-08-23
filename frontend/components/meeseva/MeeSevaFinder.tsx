'use client';

import { Icon, LoadingState } from '@/components/common';
import { Button } from '@/components/ui';
import { useMeeSeva, useTranslation } from '@/hooks';
import type { MeeSevaError } from '@/hooks';
import type { MeeSevaCentre } from '@/types';
import { GoogleMap } from './GoogleMap';

const ERROR_STRING: Record<MeeSevaError, 'meeGeoDenied' | 'meeGeoUnavail' | 'meeMapsOff' | 'meeFailed'> = {
  'geo-denied': 'meeGeoDenied',
  'geo-unavailable': 'meeGeoUnavail',
  'maps-off': 'meeMapsOff',
  failed: 'meeFailed',
};

function directionsUrl(c: MeeSevaCentre): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
}

/** The on-demand Mee Seva centre finder. Location is requested only on tap. */
export function MeeSevaFinder() {
  const { t } = useTranslation();
  const { status, error, centres, origin, config, find } = useMeeSeva();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{t('meeTitle')}</h1>
        <p className="mt-2 text-lg leading-relaxed text-muted">{t('meeSub')}</p>
      </header>

      {status === 'idle' && (
        <div className="rounded-xl2 border border-navy-100 bg-white p-5 text-center shadow-soft">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-navy-50 text-navy-600">
            <Icon name="scan" className="h-8 w-8" />
          </span>
          <p className="mx-auto mt-4 max-w-xs text-base leading-relaxed text-muted">{t('meeWhy')}</p>
          <Button full size="lg" className="mt-4" onClick={find}>
            <Icon name="search" className="h-5 w-5" />
            {t('meeFind')}
          </Button>
        </div>
      )}

      {(status === 'locating' || status === 'loading') && (
        <LoadingState label={status === 'locating' ? t('meeLocating') : t('meeLoading')} />
      )}

      {status === 'error' && error && (
        <div className="space-y-3 rounded-xl2 border border-amberx-100 bg-amberx-50 p-5">
          <p className="text-lg leading-relaxed text-amberx-700">{t(ERROR_STRING[error])}</p>
          <div className="flex flex-col gap-2">
            <Button size="md" variant="secondary" onClick={find}>
              <Icon name="right" className="h-5 w-5" />
              {t('meeRetry')}
            </Button>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Mee+Seva+center"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-navy-200 bg-white px-4 text-base font-semibold text-navy-700"
            >
              <Icon name="globe" className="h-5 w-5" />
              {t('meeOpenMaps')}
            </a>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <>
          {config?.browserKey && origin && centres.length > 0 && (
            <GoogleMap browserKey={config.browserKey} origin={origin} centres={centres} />
          )}

          {centres.length === 0 ? (
            <div className="space-y-3 rounded-xl2 border border-navy-100 bg-white p-5">
              <p className="text-lg text-muted">{t('meeNone')}</p>
              <Button size="md" variant="secondary" onClick={find}>
                {t('meeRetry')}
              </Button>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {centres.map((c, i) => (
                <li
                  key={`${c.name}-${i}`}
                  className="rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-bold leading-snug">{c.name}</p>
                      {c.address && (
                        <p className="mt-0.5 text-base leading-snug text-muted">{c.address}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-navy-50 px-2.5 py-1 text-sm font-semibold text-navy-700">
                      {c.distanceKm} km {t('meeAway')}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {c.openNow === true && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-700">
                        <span className="h-2 w-2 rounded-full bg-leaf-600" />
                        {t('meeOpenNow')}
                      </span>
                    )}
                    {c.openNow === false && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        {t('meeClosed')}
                      </span>
                    )}
                    <a
                      href={directionsUrl(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-navy-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      <Icon name="right" className="h-4 w-4" />
                      {t('meeDirections')}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
