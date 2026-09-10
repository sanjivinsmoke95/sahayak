/**
 * Google Maps loader + client-side Mee Seva search.
 *
 * Uses the legacy Places API (PlacesService.nearbySearch) rather than the
 * Places API (New) / Place.searchByText, because the newer API requires a
 * separate enablement step in Google Cloud Console and commonly fails with
 * a browser-restricted key. The legacy API works with the same key as the
 * Maps JavaScript API.
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

/** Nearby Mee Seva centres via the legacy Places nearbySearch, client-side. */
export async function searchMeeSeva(
  key: string,
  lat: number,
  lng: number,
  radius = 6000,
): Promise<RawCentre[]> {
  const google = await loadGoogleMaps(key);

  return new Promise<RawCentre[]>((resolve, reject) => {
    // PlacesService requires a map or HTML element — use a detached div.
    const div = document.createElement('div');
    const map = new google.maps.Map(div, { center: { lat, lng }, zoom: 14 });
    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(
      {
        location: new google.maps.LatLng(lat, lng),
        radius,
        keyword: 'Meeseva center',
      },
      (results: GoogleNS[], status: string) => {
        const OK = google.maps.places.PlacesServiceStatus.OK;
        const ZERO = google.maps.places.PlacesServiceStatus.ZERO_RESULTS;
        if (status !== OK && status !== ZERO) {
          reject(new Error(`Places API: ${status}`));
          return;
        }

        const out: RawCentre[] = [];
        for (const p of results ?? []) {
          const loc = p.geometry?.location;
          const pLat = typeof loc?.lat === 'function' ? loc.lat() : null;
          const pLng = typeof loc?.lng === 'function' ? loc.lng() : null;
          if (pLat == null || pLng == null) continue;

          out.push({
            name: p.name ?? '',
            address: p.vicinity ?? '',
            lat: pLat,
            lng: pLng,
            rating: p.rating ?? null,
            openNow: p.opening_hours?.open_now ?? null,
          });
        }
        resolve(out);
      },
    );
  });
}
