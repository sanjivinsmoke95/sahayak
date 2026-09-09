'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useAuthToken } from '@/hooks';
import { useQuery, useMutation } from '@tanstack/react-query';
import { documentsService } from '@/lib/sahayak/documents';
import { aiService } from '@/lib/sahayak/ai';
import { toast } from 'sonner';
import type { AskResponse, DocumentRead, Lang, Localized, LocalizedList } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

function loc(field: Localized | null | undefined, lang: Lang): string {
  if (!field) return '';
  return field[lang] ?? field.en ?? '';
}

function locList(field: LocalizedList | null | undefined, lang: Lang): string[] {
  if (!field) return [];
  return field[lang] ?? field.en ?? [];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ ...F, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sh-blue)', margin: '0 0 10px' }}>{title}</h3>
      {children}
    </div>
  );
}

function Prose({ text }: { text: string }) {
  return <p style={{ ...F, fontSize: 15, color: 'var(--sh-dark-ink)', lineHeight: 1.7, margin: 0 }}>{text}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
          <span style={{ flexShrink: 0, marginTop: 4, width: 6, height: 6, borderRadius: '50%', background: 'var(--sh-blue)' }} />
          <span style={{ ...F, fontSize: 14, color: 'var(--sh-dark-ink)', lineHeight: 1.6 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--sh-bg)', borderRadius: 8, padding: 3 }}>
      {(['en', 'hi', 'te'] as Lang[]).map(l => (
        <button key={l} onClick={() => onChange(l)} style={{
          ...F, border: 'none', cursor: 'pointer', borderRadius: 6,
          padding: '5px 12px', fontSize: 13, fontWeight: lang === l ? 700 : 500,
          background: lang === l ? 'white' : 'transparent',
          color: lang === l ? 'var(--sh-blue)' : 'var(--sh-ink-muted)',
          boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.15s',
        }}>
          {l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'తెలుగు'}
        </button>
      ))}
    </div>
  );
}

function ChatPanel({ documentId, lang }: { documentId: string; lang: Lang }) {
  const getToken = useAuthToken();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; list?: string[] }>>([]);
  const [input, setInput] = useState('');

  const { mutate: ask, isPending } = useMutation({
    mutationFn: async (question: string) => {
      const token = (await getToken()) ?? '';
      return aiService.ask({
        question,
        lang,
        documentId,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      }, token);
    },
    onMutate: (question) => {
      setMessages(prev => [...prev, { role: 'user', content: question }]);
      setInput('');
    },
    onSuccess: (data: AskResponse) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.text, list: data.list ?? [] }]);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  function send() {
    const q = input.trim();
    if (!q || isPending) return;
    ask(q);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 520, background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--sh-border)', background: 'var(--sh-soft-blue)' }}>
        <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-blue)', margin: 0 }}>AI document assistant</p>
        <p style={{ ...F, fontSize: 12, color: 'var(--sh-ink-muted)', margin: 0 }}>Ask anything about this document</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ fontSize: 24, margin: '0 0 8px' }}>💬</p>
            <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)' }}>Ask about deadlines, what to do, where to go, and more.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%',
              background: m.role === 'user' ? 'var(--sh-blue)' : 'var(--sh-bg)',
              color: m.role === 'user' ? 'white' : 'var(--sh-dark-ink)',
              borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              padding: '10px 14px', fontSize: 14, lineHeight: 1.6,
              ...F,
            }}>
              <p style={{ margin: 0 }}>{m.content}</p>
              {m.list && m.list.length > 0 && (
                <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>
                  {m.list.map((item, j) => <li key={j} style={{ marginBottom: 4 }}>{item}</li>)}
                </ul>
              )}
            </div>
          </div>
        ))}
        {isPending && (
          <div style={{ display: 'flex' }}>
            <div style={{ background: 'var(--sh-bg)', borderRadius: '12px 12px 12px 4px', padding: '10px 16px' }}>
              <span style={{ display: 'inline-flex', gap: 4 }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sh-ink-faint)', display: 'inline-block' }} />)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['What is the deadline?', 'What do I need to do?', 'Where do I submit this?'].map(q => (
            <button key={q} onClick={() => { setInput(q); }} style={{ ...F, background: 'var(--sh-soft-blue)', border: '1px solid var(--sh-border)', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 500, color: 'var(--sh-blue)', cursor: 'pointer' }}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--sh-border)', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask anything about this document…"
          style={{ ...F, flex: 1, border: '1.5px solid var(--sh-border)', borderRadius: 8, padding: '9px 14px', fontSize: 14, color: 'var(--sh-ink)', background: '#fff', outline: 'none' }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || isPending}
          style={{ background: input.trim() ? 'var(--sh-blue)' : '#CBD5E1', border: 'none', borderRadius: 8, padding: '0 16px', cursor: input.trim() ? 'pointer' : 'not-allowed', color: 'white' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15.75 9L2.25 3.75L6.75 9L2.25 14.25L15.75 9Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const getToken = useAuthToken();
  const [lang, setLang] = useState<Lang>('en');

  const { data: doc, isLoading, error } = useQuery<DocumentRead>({
    queryKey: ['document', slug],
    queryFn: async () => {
      const token = await getToken();
      return documentsService.get(slug, token ?? '');
    },
  });

  if (isLoading) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--sh-border)', borderTopColor: 'var(--sh-blue)', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)' }}>Loading document…</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <p style={{ ...F, fontSize: 20, color: 'var(--sh-danger)', fontWeight: 700 }}>Could not load document</p>
        <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)' }}>{(error as Error)?.message}</p>
        <Link href="/app/documents" style={{ ...F, color: 'var(--sh-blue)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Back to documents</Link>
      </div>
    );
  }

  const title = loc(doc.title, lang) || doc.docType || 'Document';
  const issuer = loc(doc.issuer, lang);
  const what = loc(doc.what, lang);
  const why = loc(doc.why, lang);
  const where = loc(doc.where, lang);
  const explain = loc(doc.explain, lang);
  const ifNot = loc(doc.ifNot, lang);
  const steps = locList(doc.steps, lang);
  const need = locList(doc.need, lang);

  return (
    <div style={{ padding: '0 0 64px' }}>
      {/* Header */}
      <div style={{ padding: '24px 40px 20px', borderBottom: '1px solid var(--sh-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <Link href="/app/documents" style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            My documents
          </Link>
          <h1 style={{ ...F, fontSize: 22, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>{title}</h1>
          {issuer && <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: 0 }}>{issuer}</p>}
        </div>
        <LangToggle lang={lang} onChange={setLang} />
      </div>

      {/* Processing state */}
      {doc.status !== 'done' && (
        <div style={{ margin: '24px 40px', background: 'var(--sh-soft-blue)', border: '1px solid var(--sh-border)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--sh-border)', borderTopColor: 'var(--sh-blue)', flexShrink: 0, animation: 'spin 0.8s linear infinite' }} />
          <div>
            <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-blue)', margin: 0 }}>Analyzing your document…</p>
            <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: 0 }}>This usually takes 15–30 seconds. The page will update automatically.</p>
          </div>
        </div>
      )}

      {/* Main content grid */}
      {doc.status === 'done' && (
        <div style={{ padding: '32px 40px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' }}>
          {/* Left: Analysis */}
          <div>
            {/* Key facts bar */}
            {(doc.refNo || doc.received || doc.deadline) && (
              <div style={{ background: 'var(--sh-doc)', border: '1px solid #E8DFC0', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {doc.refNo && (
                  <div>
                    <p style={{ ...F, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--sh-ink-faint)', margin: '0 0 2px' }}>Reference</p>
                    <p style={{ ...F, fontSize: 14, fontWeight: 600, color: 'var(--sh-dark-ink)', margin: 0, fontFamily: 'monospace' }}>{doc.refNo}</p>
                  </div>
                )}
                {doc.received && (
                  <div>
                    <p style={{ ...F, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--sh-ink-faint)', margin: '0 0 2px' }}>Issued</p>
                    <p style={{ ...F, fontSize: 14, fontWeight: 600, color: 'var(--sh-dark-ink)', margin: 0 }}>{doc.received}</p>
                  </div>
                )}
                {doc.deadline && (
                  <div>
                    <p style={{ ...F, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D9972B', margin: '0 0 2px' }}>⏰ Deadline</p>
                    <p style={{ ...F, fontSize: 14, fontWeight: 700, color: '#D9972B', margin: 0 }}>{doc.deadline}</p>
                  </div>
                )}
              </div>
            )}

            {/* What is this */}
            {what && (
              <Section title="What is this document?">
                <Prose text={what} />
              </Section>
            )}

            {/* Why received */}
            {why && (
              <Section title="Why did you receive this?">
                <Prose text={why} />
              </Section>
            )}

            {/* Detailed explanation */}
            {explain && (
              <Section title="What does it mean?">
                <Prose text={explain} />
              </Section>
            )}

            {/* Steps */}
            {steps.length > 0 && (
              <Section title="What you need to do">
                <BulletList items={steps} />
              </Section>
            )}

            {/* Documents needed */}
            {need.length > 0 && (
              <Section title="Documents you may need">
                <BulletList items={need} />
              </Section>
            )}

            {/* Where to go */}
            {where && (
              <Section title="Where to go">
                <div style={{ background: '#F0FBF5', border: '1px solid #C3E8D4', borderRadius: 10, padding: '14px 16px' }}>
                  <Prose text={where} />
                </div>
              </Section>
            )}

            {/* If you don't act */}
            {ifNot && (
              <Section title="What happens if you don't act">
                <div style={{ background: '#FFF3F3', border: '1px solid #F5C6C6', borderRadius: 10, padding: '14px 16px' }}>
                  <Prose text={ifNot} />
                </div>
              </Section>
            )}

            {/* Personal data */}
            {doc.personal && Object.keys(doc.personal).length > 0 && (
              <Section title="Your information">
                <div style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 10, overflow: 'hidden' }}>
                  {Object.entries(doc.personal).map(([k, v], i) => (
                    <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', borderBottom: i < Object.keys(doc.personal!).length - 1 ? '1px solid var(--sh-border)' : 'none', padding: '10px 16px' }}>
                      <span style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', fontWeight: 500 }}>{k}</span>
                      <span style={{ ...F, fontSize: 13, color: 'var(--sh-dark-ink)', fontWeight: 600 }}>
                        {k.toLowerCase().includes('number') && v.length > 6
                          ? v.slice(0, 4) + '••••' + v.slice(-2)
                          : v}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* FAQ pairs */}
            {doc.pairs && doc.pairs.length > 0 && (
              <Section title="Common questions">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {doc.pairs.map((p, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 10, padding: '14px 16px' }}>
                      <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 6px' }}>{loc(p.q, lang)}</p>
                      <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', lineHeight: 1.6, margin: 0 }}>{loc(p.a, lang)}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Right: Chat panel */}
          <div style={{ position: 'sticky', top: 16 }}>
            <ChatPanel documentId={doc.id} lang={lang} />

            {/* Quick links */}
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <Link href="/app/schemes" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 8, padding: '10px', textDecoration: 'none', ...F, fontSize: 13, fontWeight: 600, color: 'var(--sh-dark-ink)' }}>
                <span>⭐</span> Scheme matches
              </Link>
              <Link href="/app/services" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 8, padding: '10px', textDecoration: 'none', ...F, fontSize: 13, fontWeight: 600, color: 'var(--sh-dark-ink)' }}>
                <span>📍</span> Mee Seva nearby
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
