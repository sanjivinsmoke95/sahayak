'use client';

import { useState } from 'react';
import { useAuthToken } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { schemesService } from '@/lib/sahayak/schemes';
import type { SchemeSummary } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

const CATEGORIES = ['All', 'Agriculture', 'Education', 'Health', 'Housing', 'Social Welfare', 'Employment', 'Women & Child'];
const LEVELS = ['All', 'Central', 'State', 'District'];

const LEVEL_COLOR: Record<string, { bg: string; color: string }> = {
  Central: { bg: '#EBF4FF', color: '#1557B0' },
  State: { bg: '#E8F7F0', color: '#2E8B67' },
  District: { bg: '#FFF8EC', color: '#D9972B' },
};

function SchemeCard({ scheme }: { scheme: SchemeSummary }) {
  const lc = LEVEL_COLOR[scheme.level] ?? { bg: '#F5F5F5', color: '#666' };
  return (
    <div style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 12, padding: '18px 20px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'var(--sh-blue)'; el.style.boxShadow = '0 2px 12px rgba(21,87,176,0.08)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'var(--sh-border)'; el.style.boxShadow = 'none'; }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <h3 style={{ ...F, fontSize: 15, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: 0, flex: 1 }}>{scheme.name}</h3>
        <span style={{ ...F, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '3px 10px', flexShrink: 0, ...lc }}>{scheme.level}</span>
      </div>
      <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: '0 0 12px', lineHeight: 1.55 }}>{scheme.benefit}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ ...F, fontSize: 12, background: 'var(--sh-bg)', color: 'var(--sh-ink-muted)', borderRadius: 6, padding: '3px 8px' }}>{scheme.category}</span>
        <span style={{ ...F, fontSize: 12, color: scheme.status === 'active' ? '#2E8B67' : '#D9972B', fontWeight: 600 }}>
          {scheme.status === 'active' ? '● Active' : '○ Inactive'}
        </span>
      </div>
    </div>
  );
}

export default function SchemesPage() {
  const getToken = useAuthToken();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');

  const params = {
    q: search || undefined,
    category: category !== 'All' ? category : undefined,
    level: level !== 'All' ? level : undefined,
    limit: 50,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['schemes', params],
    queryFn: async () => {
      const token = await getToken();
      return schemesService.list(params, token ?? '');
    },
  });

  const schemes = data?.results ?? [];

  return (
    <div style={{ padding: '0 0 48px' }}>
      <div style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--sh-border)' }}>
        <h1 style={{ ...F, fontSize: 24, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>Government schemes</h1>
        <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: 0 }}>Welfare benefits and schemes you may be eligible for</p>
      </div>

      <div style={{ padding: '24px 40px', borderBottom: '1px solid var(--sh-border)' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16, maxWidth: 480 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--sh-ink-faint)' }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search schemes by name or benefit…"
            style={{ ...F, width: '100%', border: '1.5px solid var(--sh-border)', borderRadius: 8, padding: '10px 12px 10px 36px', fontSize: 14, color: 'var(--sh-ink)', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <p style={{ ...F, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sh-ink-faint)', margin: '0 0 8px' }}>Category</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{
                  ...F, border: '1px solid', borderRadius: 999, padding: '5px 12px',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  borderColor: category === c ? 'var(--sh-blue)' : 'var(--sh-border)',
                  background: category === c ? 'var(--sh-soft-blue)' : '#fff',
                  color: category === c ? 'var(--sh-blue)' : 'var(--sh-ink-muted)',
                }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ ...F, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sh-ink-faint)', margin: '0 0 8px' }}>Level</p>
            <div style={{ display: 'flex', gap: 6 }}>
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(l)} style={{
                  ...F, border: '1px solid', borderRadius: 999, padding: '5px 12px',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  borderColor: level === l ? 'var(--sh-blue)' : 'var(--sh-border)',
                  background: level === l ? 'var(--sh-soft-blue)' : '#fff',
                  color: level === l ? 'var(--sh-blue)' : 'var(--sh-ink-muted)',
                }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 40px' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[0,1,2,3,4,5].map(i => <div key={i} style={{ height: 120, borderRadius: 12, background: '#E8F1FC' }} />)}
          </div>
        ) : schemes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>⭐</p>
            <p style={{ ...F, fontSize: 16, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 8px' }}>No schemes found</p>
            <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: '0 0 16px' }}>{data?.total ?? schemes.length} schemes found</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {schemes.map((s: SchemeSummary) => <SchemeCard key={s.id} scheme={s} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
