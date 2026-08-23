'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '@/lib/google-maps';
import type { MeeSevaCentre } from '@/types';

interface GoogleMapProps {
  browserKey: string;
  origin: { lat: number; lng: number };
  centres: MeeSevaCentre[];
}

/**
 * The interactive map, drawn only when a restricted browser key is available.
 * If the script cannot load it renders nothing, so the list beside it remains
 * the reliable path.
 */
export function GoogleMap({ browserKey, origin, centres }: GoogleMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps(browserKey)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((g: any) => {
        if (cancelled || !ref.current) return;
        const map = new g.maps.Map(ref.current, {
          center: origin,
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
        });
        new g.maps.Marker({
          map,
          position: origin,
          title: 'You',
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#1d4ed8',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
        const bounds = new g.maps.LatLngBounds();
        bounds.extend(origin);
        centres.forEach((c) => {
          new g.maps.Marker({ map, position: { lat: c.lat, lng: c.lng }, title: c.name });
          bounds.extend({ lat: c.lat, lng: c.lng });
        });
        if (centres.length) map.fitBounds(bounds);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [browserKey, origin, centres]);

  if (failed) return null;
  return <div ref={ref} className="h-64 w-full overflow-hidden rounded-xl2 border border-navy-100" />;
}
