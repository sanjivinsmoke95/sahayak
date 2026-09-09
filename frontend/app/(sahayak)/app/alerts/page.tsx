'use client';

import Link from 'next/link';
import { useAuthToken } from '@/hooks';
import { useQuery } from '@tanstack/react-query';
import { documentsService } from '@/lib/sahayak/documents';
import type { DocumentRead } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

function daysUntil(dateStr: string): number | null {
  try {
    const deadline = new Date(dateStr);
    if (isNaN(deadline.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

function urgencyColor(days: number | null): { bg: string; color: string; border: string } {
  if (days === null) return { bg: '#F5F5F5', color: '#666', border: '#E0E0E0' };
  if (days < 0) return { bg: '#FDECEA', color: '#D9535B', border: '#F5C6C6' };
  if (days <= 3) return { bg: '#FDECEA', color: '#D9535B', border: '#F5C6C6' };
  if (days <= 14) return { bg: '#FFF8EC', color: '#D9972B', border: '#F5E5C0' };
  return { bg: '#E8F7F0', color: '#2E8B67', border: '#C3E8D4' };
}

function urgencyLabel(days: number | null): string {
  if (days === null) return 'Due date set';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today!';
  if (days === 1) return 'Due tomorrow';
  return `${days} days left`;
}

function AlertCard({ doc }: { doc: DocumentRead }) {
  const title = doc.title?.en ?? doc.docType ?? 'Document';
  const issuer = doc.issuer?.en;
  const days = doc.deadline ? daysUntil(doc.deadline) : null;
  const { bg, color, border } = urgencyColor(days);

  return (
    <Link href={`/app/documents/${doc.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: '#fff', border: `1px solid ${border}`, borderLeft: `4px solid ${color}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
          {days !== null && days < 0 ? '🚨' : days !== null && days <= 3 ? '⚠️' : '📅'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...F, fontSize: 15, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 2px' }}>{title}</p>
          {issuer && <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: '0 0 6px' }}>{issuer}</p>}
          {doc.deadline && <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-faint)', margin: 0 }}>Deadline: {doc.deadline}</p>}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <span style={{ ...F, display: 'inline-block', background: bg, color, border: `1px solid ${border}`, borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
            {urgencyLabel(days)}
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--sh-ink-faint)' }}>
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </Link>
  );
}

export default function AlertsPage() {
  const getToken = useAuthToken();

  const { data: docs, isLoading } = useQuery<DocumentRead[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const token = await getToken();
      return documentsService.list(token ?? '');
    },
  });

  const withDeadlines = (Array.isArray(docs) ? docs : [])
    .filter(d => d.deadline)
    .sort((a, b) => {
      const dA = daysUntil(a.deadline!);
      const dB = daysUntil(b.deadline!);
      if (dA === null && dB === null) return 0;
      if (dA === null) return 1;
      if (dB === null) return -1;
      return dA - dB;
    });

  const overdue = withDeadlines.filter(d => { const days = daysUntil(d.deadline!); return days !== null && days < 0; });
  const urgent = withDeadlines.filter(d => { const days = daysUntil(d.deadline!); return days !== null && days >= 0 && days <= 14; });
  const upcoming = withDeadlines.filter(d => { const days = daysUntil(d.deadline!); return days !== null && days > 14; });

  return (
    <div style={{ padding: '0 0 64px' }}>
      {/* Header */}
      <div style={{ padding: '28px 40px 24px', borderBottom: '1px solid var(--sh-border)' }}>
        <h1 style={{ ...F, fontSize: 24, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>Deadlines & alerts</h1>
        <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: 0 }}>
          Documents with upcoming or overdue deadlines from your library.
        </p>
      </div>

      <div style={{ padding: '32px 40px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ height: 82, borderRadius: 12, background: '#E8F1FC', animation: 'pulse 1.5s infinite' }} />)}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>
        ) : withDeadlines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 32px', maxWidth: 400, margin: '0 auto' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ ...F, fontSize: 20, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 10px' }}>No deadlines found</h2>
            <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', lineHeight: 1.6, margin: '0 0 24px' }}>
              None of your analyzed documents have deadlines. Upload documents to get deadline tracking.
            </p>
            <Link href="/app/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--sh-blue)', color: 'white', borderRadius: 10, padding: '11px 22px', textDecoration: 'none', ...F, fontSize: 14, fontWeight: 700 }}>
              Upload a document
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {overdue.length > 0 && (
              <div>
                <h2 style={{ ...F, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D9535B', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  🚨 Overdue ({overdue.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {overdue.map(d => <AlertCard key={d.id} doc={d} />)}
                </div>
              </div>
            )}
            {urgent.length > 0 && (
              <div>
                <h2 style={{ ...F, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D9972B', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚠️ Due within 14 days ({urgent.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {urgent.map(d => <AlertCard key={d.id} doc={d} />)}
                </div>
              </div>
            )}
            {upcoming.length > 0 && (
              <div>
                <h2 style={{ ...F, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2E8B67', margin: '0 0 12px' }}>
                  📅 Upcoming ({upcoming.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {upcoming.map(d => <AlertCard key={d.id} doc={d} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
