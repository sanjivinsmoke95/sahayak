'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { govServicesService } from '@/lib/sahayak/govServices';
import type { GovService } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

function ServiceCard({ svc, onClick }: { svc: GovService; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 12, padding: '18px 20px', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'var(--sh-blue)'; el.style.boxShadow = '0 2px 12px rgba(21,87,176,0.08)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'var(--sh-border)'; el.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        <h3 style={{ ...F, fontSize: 15, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: 0, flex: 1 }}>{svc.service_name}</h3>
        {svc.fees && (
          <span style={{ ...F, fontSize: 12, background: '#E8F7F0', color: '#2E8B67', borderRadius: 6, padding: '3px 8px', flexShrink: 0, fontWeight: 600 }}>{svc.fees}</span>
        )}
      </div>
      <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: '0 0 12px', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {svc.description}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <span style={{ ...F, fontSize: 12, background: 'var(--sh-bg)', color: 'var(--sh-ink-muted)', borderRadius: 6, padding: '3px 8px' }}>{svc.department}</span>
        {svc.processing_time && (
          <span style={{ ...F, fontSize: 12, color: 'var(--sh-ink-faint)' }}>⏱ {svc.processing_time}</span>
        )}
      </div>
    </div>
  );
}

function ServiceDetail({ svc, onClose }: { svc: GovService; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(9,43,90,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 640, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <h2 style={{ ...F, fontSize: 18, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: 0 }}>{svc.service_name}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sh-ink-muted)', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: '0 0 20px', lineHeight: 1.6 }}>{svc.description}</p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          {svc.fees && <div style={{ background: '#E8F7F0', borderRadius: 8, padding: '8px 14px' }}><p style={{ ...F, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#2E8B67', margin: '0 0 2px' }}>Fee</p><p style={{ ...F, fontSize: 14, fontWeight: 600, color: '#2E8B67', margin: 0 }}>{svc.fees}</p></div>}
          {svc.processing_time && <div style={{ background: 'var(--sh-bg)', borderRadius: 8, padding: '8px 14px' }}><p style={{ ...F, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--sh-ink-muted)', margin: '0 0 2px' }}>Processing time</p><p style={{ ...F, fontSize: 14, fontWeight: 600, color: 'var(--sh-dark-ink)', margin: 0 }}>{svc.processing_time}</p></div>}
        </div>

        {svc.eligibility.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ ...F, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sh-blue)', margin: '0 0 8px' }}>Eligibility</p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>{svc.eligibility.map((e, i) => <li key={i} style={{ ...F, fontSize: 14, color: 'var(--sh-dark-ink)', marginBottom: 4 }}>{e}</li>)}</ul>
          </div>
        )}

        {svc.required_documents.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ ...F, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sh-blue)', margin: '0 0 8px' }}>Required documents</p>
            <ul style={{ margin: 0, paddingLeft: 16 }}>{svc.required_documents.map((d, i) => <li key={i} style={{ ...F, fontSize: 14, color: 'var(--sh-dark-ink)', marginBottom: 4 }}>{d}</li>)}</ul>
          </div>
        )}

        {svc.application_steps.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ ...F, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sh-blue)', margin: '0 0 8px' }}>How to apply</p>
            <ol style={{ margin: 0, paddingLeft: 16 }}>{svc.application_steps.map((s, i) => <li key={i} style={{ ...F, fontSize: 14, color: 'var(--sh-dark-ink)', marginBottom: 6, lineHeight: 1.5 }}>{s}</li>)}</ol>
          </div>
        )}

        {svc.official_application_url && (
          <a href={svc.official_application_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--sh-blue)', color: 'white', borderRadius: 8, padding: '10px 20px', textDecoration: 'none', ...F, fontSize: 14, fontWeight: 700 }}>
            Apply online
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<GovService | null>(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ['gov-services', search],
    queryFn: () => govServicesService.search({ q: search || 'certificate', limit: 30 }),
    enabled: true,
  });

  return (
    <div style={{ padding: '0 0 48px' }}>
      <div style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--sh-border)' }}>
        <h1 style={{ ...F, fontSize: 24, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>Government services</h1>
        <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: 0 }}>Search for government services, eligibility, and how to apply</p>
      </div>

      <div style={{ padding: '24px 40px', borderBottom: '1px solid var(--sh-border)' }}>
        <div style={{ position: 'relative', maxWidth: 560 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--sh-ink-faint)' }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for a service (e.g. income certificate, ration card, passport)…"
            style={{ ...F, width: '100%', border: '1.5px solid var(--sh-border)', borderRadius: 10, padding: '12px 14px 12px 38px', fontSize: 14, color: 'var(--sh-ink)', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ padding: '24px 40px' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {[0,1,2,3].map(i => <div key={i} style={{ height: 120, borderRadius: 12, background: '#E8F1FC' }} />)}
          </div>
        ) : !results || results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <p style={{ ...F, fontSize: 16, fontWeight: 700, color: 'var(--sh-ink-muted)' }}>No services found. Try a different search.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {results.map((s: GovService) => <ServiceCard key={s.id} svc={s} onClick={() => setSelected(s)} />)}
          </div>
        )}
      </div>

      {selected && <ServiceDetail svc={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
