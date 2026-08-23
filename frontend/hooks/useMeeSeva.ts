'use client';

import { useCallback, useState } from 'react';
import { searchMeeSeva } from '@/lib/google-maps';
import { placesService } from '@/services';
import type { MapsConfig, MeeSevaCentre } from '@/types';
import { useAuthToken } from './useAuthToken';

export type MeeSevaStatus = 'idle' | 'locating' | 'loading' | 'ready' | 'error';
export type MeeSevaError = 'geo-denied' | 'geo-unavailable' | 'maps-off' | 'failed';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(a)) * 100) / 100;
}

/**
 * The Mee Seva centre search. Location is requested only when `find` is called
 * — never on page load. When a browser Maps key is configured the search runs
 * client-side against the Places API (New); otherwise it falls back to the
 * server proxy. Every failure resolves to a typed reason the UI can explain.
 */
export function useMeeSeva() {
  const getToken = useAuthToken();
  const [status, setStatus] = useState<MeeSevaStatus>('idle');
  const [error, setError] = useState<MeeSevaError | null>(null);
  const [centres, setCentres] = useState<MeeSevaCentre[]>([]);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [config, setConfig] = useState<MapsConfig | null>(null);

  const loadCentres = useCallback(
    async (lat: number, lng: number) => {
      const token = await getToken();
      const cfg = await placesService.config(token);
      setConfig(cfg);

      if (!cfg.enabled) {
        setCentres([]);
        setError('maps-off');
        setStatus('error');
        return;
      }

      // Preferred path: search in the browser with the referrer-restricted key.
      if (cfg.browserKey) {
        const raw = await searchMeeSeva(cfg.browserKey, lat, lng);
        const mapped: MeeSevaCentre[] = raw
          .map((c) => ({ ...c, distanceKm: haversineKm(lat, lng, c.lat, c.lng) }))
          .sort((a, b) => a.distanceKm - b.distanceKm);
        setCentres(mapped);
        setStatus('ready');
        return;
      }

      // Fallback: server proxy (used when only a server key is configured).
      const res = await placesService.meeSeva(lat, lng, token);
      if (!res.enabled) {
        setCentres([]);
        setError('maps-off');
        setStatus('error');
        return;
      }
      setCentres(res.results);
      setStatus('ready');
    },
    [getToken],
  );

  const find = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setError('geo-unavailable');
      setStatus('error');
      return;
    }
    setStatus('locating');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setOrigin({ lat, lng });
        setStatus('loading');
        loadCentres(lat, lng).catch(() => {
          setError('failed');
          setStatus('error');
        });
      },
      (geoError) => {
        setError(geoError.code === geoError.PERMISSION_DENIED ? 'geo-denied' : 'geo-unavailable');
        setStatus('error');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, [loadCentres]);

  return { status, error, centres, origin, config, find };
}
