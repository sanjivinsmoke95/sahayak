'use client';

import { useState } from 'react';
import { placesService } from '@/lib/sahayak/places';
import type { Place } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

type GeoState = 'idle' | 'loading' | 'done' | 'error';

function CentreCard({ place }: { place: Place }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 12, padding: '18px 20px', transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(21,87,176,0.08)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--sh-soft-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
          🏛️
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...F, fontSize: 15, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>{place.name}</p>
          {place.address && <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>{place.address}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ ...F, fontSize: 12, background: 'var(--sh-soft-blue)', color: 'var(--sh-blue)', borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>
              📍 {place.distanceKm.toFixed(1)}km away
            </span>
            {place.openNow !== null && (
              <span style={{ ...F, fontSize: 12, background: place.openNow ? '#E8F7F0' : '#FDECEA', color: place.openNow ? '#2E8B67' : '#D9535B', borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>
                {place.openNow ? '🟢 Open now' : '🔴 Closed'}
              </span>
            )}
            {place.rating && (
              <span style={{ ...F, fontSize: 12, background: '#FFF8EC', color: '#D9972B', borderRadius: 6, padding: '3px 10px', fontWeight: 600 }}>
                ⭐ {place.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <a
          href={`https://maps.google.com/?q=${place.lat},${place.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ flexShrink: 0, background: 'var(--sh-blue)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', ...F, display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5C4.51 1.5 2.5 3.51 2.5 6c0 3.375 4.5 7 4.5 7s4.5-3.625 4.5-7c0-2.49-2.01-4.5-4.5-4.5zm0 6.125A1.625 1.625 0 115 6.125 1.625 1.625 0 017 7.625z" fill="white" /></svg>
          Directions
        </a>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [geoState, setGeoState] = useState<GeoState>('idle');
  const [centres, setCentres] = useState<Place[] | null>(null);
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(5000);

  function locate() {
    if (!('geolocation' in navigator)) {
      setError('Your browser does not support location access.');
      setGeoState('error');
      return;
    }
    setGeoState('loading');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const result = await placesService.meeSeva({ lat: pos.coords.latitude, lng: pos.coords.longitude, radius });
          setCentres(Array.isArray(result) ? result : []);
          setGeoState('done');
        } catch (e: unknown) {
          setError((e as Error).message ?? 'Failed to find centres');
          setGeoState('error');
        }
      },
      err => {
        setError(err.code === 1 ? 'Location access was denied. Please allow location in your browser settings.' : 'Could not determine your location.');
        setGeoState('error');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }

  return (
    <div style={{ padding: '0 0 64px' }}>
      {/* Header */}
      <div style={{ padding: '28px 40px 24px', borderBottom: '1px solid var(--sh-border)' }}>
        <h1 style={{ ...F, fontSize: 24, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>Mee Seva centres nearby</h1>
        <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: 0 }}>
          Find government service centres around you — submit documents, apply for certificates, and more.
        </p>
      </div>

      <div style={{ padding: '32px 40px' }}>
        {/* Location prompt */}
        {geoState === 'idle' && (
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '48px 32px', background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
            <h2 style={{ ...F, fontSize: 20, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 10px' }}>Find centres near you</h2>
            <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
              We&apos;ll use your current location to find the closest Mee Seva centres. Your location is never stored.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
              {[2000, 5000, 10000].map(r => (
                <button key={r} onClick={() => setRadius(r)} style={{
                  ...F, border: `1.5px solid ${radius === r ? 'var(--sh-blue)' : 'var(--sh-border)'}`,
                  background: radius === r ? 'var(--sh-soft-blue)' : '#fff',
                  color: radius === r ? 'var(--sh-blue)' : 'var(--sh-ink-muted)',
                  borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  {r / 1000}km
                </button>
              ))}
            </div>
            <button onClick={locate} style={{ ...F, background: 'var(--sh-blue)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2C5.686 2 3 4.686 3 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.314-2.686-6-6-6zm0 8.5A2.5 2.5 0 119 6a2.5 2.5 0 010 5z" fill="white" /></svg>
              Share my location
            </button>
          </div>
        )}

        {/* Loading */}
        {geoState === 'loading' && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '4px solid var(--sh-border)', borderTopColor: 'var(--sh-blue)', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ ...F, fontSize: 15, fontWeight: 600, color: 'var(--sh-dark-ink)' }}>Finding centres near you…</p>
            <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)' }}>Please allow location access if prompted.</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error */}
        {geoState === 'error' && (
          <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '40px 32px', background: '#FDECEA', border: '1px solid #F5C6C6', borderRadius: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
            <p style={{ ...F, fontSize: 15, fontWeight: 700, color: 'var(--sh-danger)', margin: '0 0 8px' }}>Location unavailable</p>
            <p style={{ ...F, fontSize: 14, color: '#6B2C2C', margin: '0 0 20px', lineHeight: 1.6 }}>{error}</p>
            <button onClick={() => setGeoState('idle')} style={{ ...F, background: 'var(--sh-blue)', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {geoState === 'done' && centres && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={{ ...F, fontSize: 15, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: 0 }}>
                {centres.length} centre{centres.length !== 1 ? 's' : ''} found within {radius / 1000}km
              </p>
              <button onClick={() => { setCentres(null); setGeoState('idle'); }} style={{ ...F, background: 'none', border: '1px solid var(--sh-border)', borderRadius: 8, padding: '7px 14px', fontSize: 13, color: 'var(--sh-ink-muted)', cursor: 'pointer', fontWeight: 500 }}>
                Change radius
              </button>
            </div>
            {centres.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', border: '1px dashed var(--sh-border)', borderRadius: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p style={{ ...F, fontSize: 16, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 8px' }}>No centres found</p>
                <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: 0 }}>Try increasing the search radius.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {centres.map((c, i) => <CentreCard key={i} place={c} />)}
              </div>
            )}
          </>
        )}

        {/* Info strip */}
        {geoState !== 'loading' && (
          <div style={{ marginTop: 40, background: 'var(--sh-soft-blue)', borderRadius: 12, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>ℹ️</span>
            <div>
              <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-blue)', margin: '0 0 4px' }}>About Mee Seva</p>
              <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: 0, lineHeight: 1.6 }}>
                Mee Seva is Telangana&apos;s government service delivery network. You can submit applications for income certificates, caste certificates, residence certificates, land records, and more — without visiting multiple offices.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
