'use client';

import Link from 'next/link';
import { useAuthToken } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { documentsService } from '@/lib/sahayak/documents';
import type { DocumentRead } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

function DocRow({ doc }: { doc: DocumentRead }) {
  const title = doc.title?.en ?? doc.docType ?? 'Document';
  const issuer = doc.issuer?.en;
  const statusMap: Record<string, { label: string; bg: string; color: string }> = {
    done: { label: 'Analyzed', bg: '#E8F7F0', color: '#2E8B67' },
    processing: { label: 'Processing', bg: '#EBF4FF', color: '#1557B0' },
    pending: { label: 'Pending', bg: '#F5F5F5', color: '#666' },
    error: { label: 'Error', bg: '#FDECEA', color: '#D9535B' },
  };
  const s = statusMap[doc.status] ?? statusMap.pending;

  return (
    <Link href={`/app/documents/${doc.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--sh-blue)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--sh-border)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--sh-soft-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M11.667 2.5H5A1.667 1.667 0 003.333 4.167v11.666A1.667 1.667 0 005 17.5h10a1.667 1.667 0 001.667-1.667V8.333L11.667 2.5Z" stroke="#1557B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M11.667 2.5v5.833H17.5" stroke="#1557B0" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          <div>
            <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: 0 }}>{title}</p>
            {issuer && <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: 0 }}>{issuer}</p>}
          </div>
        </div>
        {doc.deadline && (
          <span style={{ ...F, fontSize: 12, background: '#FFF8EC', color: '#D9972B', borderRadius: 6, padding: '4px 10px', fontWeight: 600, flexShrink: 0 }}>
            Due {doc.deadline}
          </span>
        )}
        <span style={{ ...F, fontSize: 12, background: s.bg, color: s.color, borderRadius: 999, padding: '4px 12px', fontWeight: 700, flexShrink: 0 }}>{s.label}</span>
      </div>
    </Link>
  );
}

export default function DocumentsPage() {
  const getToken = useAuthToken();

  const { data: docs, isLoading, error } = useQuery<DocumentRead[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const token = await getToken();
      return documentsService.list(token ?? '');
    },
  });

  return (
    <div style={{ padding: '0 0 48px' }}>
      <div style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--sh-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ ...F, fontSize: 24, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>My documents</h1>
          <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: 0 }}>{docs ? `${docs.length} document${docs.length !== 1 ? 's' : ''}` : 'Loading…'}</p>
        </div>
        <Link href="/app/upload" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--sh-blue)', color: 'white',
          borderRadius: 8, padding: '10px 18px', textDecoration: 'none',
          ...F, fontSize: 14, fontWeight: 700,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 11.5V13.5H13.5V11.5M8 2.5V10.5M8 2.5L5 5.5M8 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Upload new
        </Link>
      </div>

      <div style={{ padding: '32px 40px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[0,1,2,3,4].map(i => <div key={i} style={{ height: 72, borderRadius: 10, background: '#E8F1FC' }} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 64 }}>
            <p style={{ ...F, fontSize: 24, margin: '0 0 8px' }}>⚠️</p>
            <p style={{ ...F, fontSize: 16, fontWeight: 700, color: 'var(--sh-danger)' }}>Failed to load documents</p>
            <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)' }}>{(error as Error).message}</p>
          </div>
        ) : !docs || docs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 24px', maxWidth: 400, margin: '0 auto' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <h2 style={{ ...F, fontSize: 20, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 12px' }}>No documents yet</h2>
            <p style={{ ...F, fontSize: 15, color: 'var(--sh-ink-muted)', margin: '0 0 28px', lineHeight: 1.6 }}>
              Upload your first government document to get a plain-language explanation.
            </p>
            <Link href="/app/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--sh-blue)', color: 'white', borderRadius: 10, padding: '12px 24px', textDecoration: 'none', ...F, fontSize: 14, fontWeight: 700 }}>
              Upload a document
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {docs.map(d => <DocRow key={d.id} doc={d} />)}
          </div>
        )}
      </div>
    </div>
  );
}
