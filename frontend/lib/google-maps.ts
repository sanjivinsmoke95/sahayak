/**
 * Google Maps loader + client-side Mee Seva search.
 *
 * The project's Maps key is referrer-restricted — safe to use in the browser,
 * but blocked server-side. So the search runs here, in the page, against the
 * Places API (New): the referer is present, the key stays restricted to this
 * origin, and no server proxy is needed. The script is loaded once and shared
 * by both the search and the interactive map.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GoogleNS = any;

let loader: Promise<GoogleNS> | null = null;

export function loadGoogleMaps(key: string): Promise<GoogleNS> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  const w = window as unknown as { google?: { maps?: unknown } };
  if (w.google?.maps) return Promise.resolve(w.google);
  if (loader) return loader;

  loader = new Promise<GoogleNS>((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}` +
      `&libraries=places&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve((window as unknown as { google: GoogleNS }).google);
    script.onerror = () => {
      loader = null;
      reject(new Error('maps failed to load'));
    };
    document.head.appendChild(script);
  });
  return loader;
}

export interface RawCentre {
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  openNow: boolean | null;
}

/** Nearby Mee Seva centres via the Places API (New) text search, client-side. */
export async function searchMeeSeva(
  key: string,
  lat: number,
  lng: number,
  radius = 6000,
): Promise<RawCentre[]> {
  const google = await loadGoogleMaps(key);
  const { Place } = await google.maps.importLibrary('places');

  const { places } = await Place.searchByText({
    textQuery: 'Meeseva center',
    fields: ['displayName', 'formattedAddress', 'location', 'rating', 'regularOpeningHours'],
    locationBias: { center: { lat, lng }, radius },
    maxResultCount: 20,
    language: 'en',
  });

  const out: RawCentre[] = [];
  for (const p of places ?? []) {
    const loc = p.location;
    const pLat = typeof loc?.lat === 'function' ? loc.lat() : loc?.lat;
    const pLng = typeof loc?.lng === 'function' ? loc.lng() : loc?.lng;
    if (pLat == null || pLng == null) continue;

    let openNow: boolean | null = null;
    try {
      if (typeof p.isOpen === 'function') openNow = (await p.isOpen()) ?? null;
    } catch {
      openNow = null;
    }

    out.push({
      name: typeof p.displayName === 'string' ? p.displayName : p.displayName?.text ?? '',
      address: p.formattedAddress ?? '',
      lat: pLat,
      lng: pLng,
      rating: p.rating ?? null,
      openNow,
    });
  }
  return out;
}
