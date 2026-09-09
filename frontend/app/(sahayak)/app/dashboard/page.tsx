'use client';

import Link from 'next/link';
import { useAuthToken } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { documentsService } from '@/lib/sahayak/documents';
import { schemesService } from '@/lib/sahayak/schemes';
import type { DocumentRead, SchemeMatch } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

function PageHeader() {
  return (
    <div style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--sh-border)' }}>
      <h1 style={{ ...F, fontSize: 24, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>Dashboard</h1>
      <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: 0 }}>Your recent documents and matched schemes</p>
    </div>
  );
}

function DocCard({ doc }: { doc: DocumentRead }) {
  const title = doc.title?.en ?? doc.docType ?? 'Document';
  const issuer = doc.issuer?.en;
  return (
    <Link href={`/app/documents/${doc.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 10, padding: '16px 18px', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--sh-blue)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(21,87,176,0.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--sh-border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--sh-soft-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M10.5 2.25H4.5A1.5 1.5 0 003 3.75V14.25A1.5 1.5 0 004.5 15.75H13.5A1.5 1.5 0 0015 14.25V6.75L10.5 2.25Z" stroke="#1557B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.5 2.25V6.75H15" stroke="#1557B0" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <div>
              <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: 0 }}>{title}</p>
              {issuer && <p style={{ ...F, fontSize: 12, color: 'var(--sh-ink-muted)', margin: 0 }}>{issuer}</p>}
            </div>
          </div>
          <StatusBadge status={doc.status} />
        </div>
        {doc.deadline && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF8EC', borderRadius: 6, padding: '4px 10px' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.25" stroke="#D9972B" strokeWidth="1.5" /><path d="M6 3.75v2.625L7.5 8.25" stroke="#D9972B" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <span style={{ ...F, fontSize: 12, fontWeight: 600, color: '#D9972B' }}>Due: {doc.deadline}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    done: { label: 'Analyzed', bg: '#E8F7F0', color: '#2E8B67' },
    processing: { label: 'Processing', bg: '#EBF4FF', color: '#1557B0' },
    pending: { label: 'Pending', bg: '#F5F5F5', color: '#666' },
    error: { label: 'Error', bg: '#FDECEA', color: '#D9535B' },
  };
  const s = map[status] ?? map.pending;
  return <span style={{ ...F, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, borderRadius: 999, padding: '3px 10px' }}>{s.label}</span>;
}

function SchemeCard({ scheme }: { scheme: SchemeMatch }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: 0 }}>{scheme.name}</p>
        <span style={{ ...F, fontSize: 11, fontWeight: 700, background: '#E8F7F0', color: '#2E8B67', borderRadius: 999, padding: '3px 8px', flexShrink: 0 }}>
          {scheme.satisfied}/{scheme.total} matched
        </span>
      </div>
      <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: 0 }}>{scheme.benefit}</p>
    </div>
  );
}

export default function DashboardPage() {
  const getToken = useAuthToken();

  const { data: docs, isLoading: docsLoading } = useQuery<DocumentRead[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const token = await getToken();
      return documentsService.list(token ?? '');
    },
  });

  const { data: matches, isLoading: schemesLoading } = useQuery<SchemeMatch[]>({
    queryKey: ['scheme-matches'],
    queryFn: async () => {
      const token = await getToken();
      return schemesService.matches(token ?? '');
    },
  });

  const recentDocs = (Array.isArray(docs) ? docs : []).slice(0, 4);
  const topMatches = (Array.isArray(matches) ? matches : []).slice(0, 3);

  return (
    <div style={{ padding: '0 0 48px' }}>
      <PageHeader />
      <div style={{ padding: '32px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Quick actions */}
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/app/upload" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--sh-blue)', color: 'white',
            borderRadius: 10, padding: '12px 20px', textDecoration: 'none',
            ...F, fontSize: 14, fontWeight: 700,
            boxShadow: '0 2px 8px rgba(21,87,176,0.25)',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 11.5V13.5H13.5V11.5M8 2.5V10.5M8 2.5L5 5.5M8 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Upload new document
          </Link>
          <Link href="/app/chat" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fff', color: 'var(--sh-blue)',
            border: '1.5px solid var(--sh-blue)',
            borderRadius: 10, padding: '12px 20px', textDecoration: 'none',
            ...F, fontSize: 14, fontWeight: 600,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3.5A1.5 1.5 0 013.5 2H12.5A1.5 1.5 0 0114 3.5V9.5A1.5 1.5 0 0112.5 11H9.5L7 14V11H3.5A1.5 1.5 0 012 9.5V3.5Z" stroke="#1557B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Ask AI assistant
          </Link>
        </div>

        {/* Recent Documents */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ ...F, fontSize: 16, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: 0 }}>Recent documents</h2>
            <Link href="/app/documents" style={{ ...F, fontSize: 13, fontWeight: 600, color: 'var(--sh-blue)', textDecoration: 'none' }}>View all</Link>
          </div>
          {docsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0,1,2].map(i => <div key={i} style={{ height: 80, borderRadius: 10, background: '#E8F1FC', animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : recentDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 10, border: '1px dashed var(--sh-border)' }}>
              <p style={{ ...F, fontSize: 32, margin: '0 0 12px' }}>📄</p>
              <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>No documents yet</p>
              <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: 0 }}>Upload your first document to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentDocs.map(d => <DocCard key={d.id} doc={d} />)}
            </div>
          )}
        </div>

        {/* Scheme matches */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ ...F, fontSize: 16, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: 0 }}>Matched schemes</h2>
            <Link href="/app/schemes" style={{ ...F, fontSize: 13, fontWeight: 600, color: 'var(--sh-blue)', textDecoration: 'none' }}>Browse all</Link>
          </div>
          {schemesLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[0,1,2].map(i => <div key={i} style={{ height: 72, borderRadius: 10, background: '#E8F1FC', animation: 'pulse 1.5s infinite' }} />)}
            </div>
          ) : topMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 10, border: '1px dashed var(--sh-border)' }}>
              <p style={{ ...F, fontSize: 32, margin: '0 0 12px' }}>⭐</p>
              <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>No matches yet</p>
              <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: 0 }}>Upload a document to see scheme matches.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topMatches.map(s => <SchemeCard key={s.id} scheme={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
