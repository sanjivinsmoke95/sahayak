'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuthToken } from '@/hooks';
import { useQuery, useMutation } from '@tanstack/react-query';
import { documentsService } from '@/lib/sahayak/documents';
import { aiService } from '@/lib/sahayak/ai';
import { intelligenceService } from '@/lib/sahayak/intelligence';
import { toast } from 'sonner';
import type { AskResponse, DocumentRead, Lang, Localized, LocalizedList, ValidityRead, RejectionRead } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

function loc(field: Localized | null | undefined, lang: Lang): string {
  if (!field) return '';
  return field[lang] ?? field.en ?? '';
}

function locList(field: LocalizedList | null | undefined, lang: Lang): string[] {
  if (!field) return [];
  return field[lang] ?? field.en ?? [];
}

/* ── Language toggle ─────────────────────────────────────────── */
function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{ display: 'flex', gap: 3, background: 'rgba(0,0,0,0.06)', borderRadius: 8, padding: 3 }}>
      {(['en', 'hi', 'te'] as Lang[]).map(l => (
        <button key={l} onClick={() => onChange(l)} style={{
          ...F, border: 'none', cursor: 'pointer', borderRadius: 6,
          padding: '5px 12px', fontSize: 13, fontWeight: lang === l ? 700 : 500,
          background: lang === l ? 'white' : 'transparent',
          color: lang === l ? 'var(--sh-blue)' : 'var(--sh-ink-muted)',
          boxShadow: lang === l ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.15s',
        }}>
          {l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'తెలుగు'}
        </button>
      ))}
    </div>
  );
}

/* ── Voice / TTS ─────────────────────────────────────────────── */
function VoiceButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  function toggle() {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported in this browser');
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
  }

  return (
    <button onClick={toggle} title={speaking ? 'Stop reading' : 'Read aloud'} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: speaking ? 'var(--sh-blue)' : '#fff',
      color: speaking ? 'white' : 'var(--sh-ink-muted)',
      border: '1px solid var(--sh-border)', borderRadius: 8,
      padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      transition: 'all 0.15s', ...F,
    }}>
      {speaking ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="2" width="4" height="10" rx="1" fill="currentColor" />
          <rect x="8" y="2" width="4" height="10" rx="1" fill="currentColor" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 4.5h2l3-2.5v10L4 9.5H2a.5.5 0 01-.5-.5v-4A.5.5 0 012 4.5z" fill="currentColor" />
          <path d="M9.5 4.5s1.5 1 1.5 3S9.5 10 9.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      )}
      {speaking ? 'Stop' : 'Read aloud'}
    </button>
  );
}

/* ── Validity badge ──────────────────────────────────────────── */
function ValidityBadge({ validity }: { validity: ValidityRead }) {
  const cfg: Record<string, { bg: string; color: string; icon: string; label: string }> = {
    valid: { bg: '#E8F7F0', color: '#2E8B67', icon: '✓', label: 'Valid' },
    expiring: { bg: '#FFF8EC', color: '#D9972B', icon: '⚠', label: validity.daysLeft ? `Expiring in ${validity.daysLeft}d` : 'Expiring soon' },
    expired: { bg: '#FDECEA', color: '#D9535B', icon: '✗', label: 'Expired' },
    unknown: { bg: '#F5F5F5', color: '#666', icon: '?', label: 'Unknown' },
  };
  const c = cfg[validity.status] ?? cfg.unknown;
  return (
    <span style={{ ...F, display: 'inline-flex', alignItems: 'center', gap: 5, background: c.bg, color: c.color, borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
      {c.icon} {c.label}
    </span>
  );
}

/* ── Rejection alert ─────────────────────────────────────────── */
function RejectionAlert({ rejection, lang }: { rejection: RejectionRead; lang: Lang }) {
  if (!rejection.isRejection) return null;
  return (
    <div style={{ background: '#FDECEA', border: '1px solid #F5C6C6', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <p style={{ ...F, fontSize: 14, fontWeight: 700, color: '#C0392B', margin: '0 0 6px' }}>
            This appears to be a rejection or adverse notice
          </p>
          {rejection.reason && (
            <p style={{ ...F, fontSize: 14, color: '#6B2C2C', margin: '0 0 10px', lineHeight: 1.6 }}>
              {loc(rejection.reason, lang)}
            </p>
          )}
          {rejection.suggestedActions && (
            <p style={{ ...F, fontSize: 13, color: '#6B2C2C', margin: '0 0 10px' }}>
              <strong>Suggested action:</strong> {loc(rejection.suggestedActions, lang)}
            </p>
          )}
          {(rejection.appeal.phones.length > 0 || rejection.appeal.urls.length > 0) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {rejection.appeal.phones.map(p => (
                <a key={p} href={`tel:${p}`} style={{ ...F, fontSize: 13, background: 'rgba(255,255,255,0.6)', color: '#C0392B', borderRadius: 6, padding: '4px 10px', textDecoration: 'none', fontWeight: 600 }}>
                  📞 {p}
                </a>
              ))}
              {rejection.appeal.urls.map(u => (
                <a key={u} href={u} target="_blank" rel="noopener noreferrer" style={{ ...F, fontSize: 13, background: 'rgba(255,255,255,0.6)', color: '#C0392B', borderRadius: 6, padding: '4px 10px', textDecoration: 'none', fontWeight: 600 }}>
                  🔗 Appeal portal
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Section helper ──────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ ...F, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sh-blue)', margin: '0 0 10px' }}>{title}</h3>
      {children}
    </div>
  );
}

function Prose({ text }: { text: string }) {
  return <p style={{ ...F, fontSize: 15, color: 'var(--sh-dark-ink)', lineHeight: 1.75, margin: 0 }}>{text}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <span style={{ flexShrink: 0, marginTop: 7, width: 6, height: 6, borderRadius: '50%', background: 'var(--sh-blue)' }} />
          <span style={{ ...F, fontSize: 14, color: 'var(--sh-dark-ink)', lineHeight: 1.65 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── Interactive checklist for need items ────────────────────── */
function Checklist({ items, done, onToggle }: { items: string[]; done: boolean[]; onToggle: (i: number) => void }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} onClick={() => onToggle(i)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
          <div style={{
            flexShrink: 0, marginTop: 2, width: 18, height: 18, borderRadius: 4,
            border: `2px solid ${done[i] ? 'var(--sh-success)' : 'var(--sh-border)'}`,
            background: done[i] ? 'var(--sh-success)' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {done[i] && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{
            ...F, fontSize: 14, lineHeight: 1.6, transition: 'all 0.15s',
            color: done[i] ? 'var(--sh-ink-muted)' : 'var(--sh-dark-ink)',
            textDecoration: done[i] ? 'line-through' : 'none',
          }}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── Inline chat panel ───────────────────────────────────────── */
function ChatPanel({ documentId, lang }: { documentId: string; lang: Lang }) {
  const getToken = useAuthToken();
  const [messages, setMessages] = useState<Array<{ role: string; content: string; list?: string[] }>>([]);
  const [input, setInput] = useState('');

  const { mutate: ask, isPending } = useMutation({
    mutationFn: async (question: string) => {
      const token = (await getToken()) ?? '';
      return aiService.ask({
        question, lang, documentId,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      }, token);
    },
    onMutate: (q) => { setMessages(p => [...p, { role: 'user', content: q }]); setInput(''); },
    onSuccess: (d: AskResponse) => { setMessages(p => [...p, { role: 'assistant', content: d.text, list: d.list ?? [] }]); },
    onError: (e: Error) => toast.error(e.message),
  });

  function send() { const q = input.trim(); if (!q || isPending) return; ask(q); }

  const suggested = ['What is the deadline?', 'What do I need to submit?', 'Where should I go?', 'Am I eligible for any scheme?'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 540, background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', background: 'var(--sh-deep-navy)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ ...F, fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>AI document assistant</p>
        <p style={{ ...F, fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>Ask anything about this document</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ padding: '12px 0' }}>
            <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', textAlign: 'center', marginBottom: 10 }}>Try asking:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {suggested.map(q => (
                <button key={q} onClick={() => setInput(q)} style={{
                  ...F, background: 'var(--sh-bg)', border: '1px solid var(--sh-border)', borderRadius: 8,
                  padding: '8px 12px', fontSize: 13, color: 'var(--sh-dark-ink)', cursor: 'pointer',
                  textAlign: 'left', fontWeight: 500,
                }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '88%',
              background: m.role === 'user' ? 'var(--sh-blue)' : 'var(--sh-bg)',
              color: m.role === 'user' ? 'white' : 'var(--sh-dark-ink)',
              borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              padding: '9px 13px', ...F, fontSize: 13, lineHeight: 1.6,
            }}>
              <p style={{ margin: 0 }}>{m.content}</p>
              {m.list && m.list.length > 0 && (
                <ul style={{ margin: '8px 0 0', paddingLeft: 14 }}>
                  {m.list.map((it, j) => <li key={j} style={{ marginBottom: 4 }}>{it}</li>)}
                </ul>
              )}
            </div>
          </div>
        ))}
        {isPending && (
          <div style={{ display: 'flex' }}>
            <div style={{ background: 'var(--sh-bg)', borderRadius: '12px 12px 12px 3px', padding: '10px 14px', display: 'inline-flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sh-ink-faint)', display: 'inline-block', animation: `bounce 1s ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--sh-border)', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about this document…"
          style={{ ...F, flex: 1, border: '1.5px solid var(--sh-border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--sh-ink)', background: '#fff', outline: 'none' }}
          onFocus={e => { e.target.style.borderColor = 'var(--sh-blue)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--sh-border)'; }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || isPending}
          style={{ background: input.trim() ? 'var(--sh-blue)' : '#CBD5E1', border: 'none', borderRadius: 8, padding: '0 14px', cursor: input.trim() ? 'pointer' : 'not-allowed', color: 'white' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8L2 3l4 5-4 5 12-5z" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────── */
export default function DocumentPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const getToken = useAuthToken();
  const [lang, setLang] = useState<Lang>('en');
  const [checkDone, setCheckDone] = useState<boolean[]>([]);
  const isAnalyzed = (status: string | undefined) => status === 'done' || status === 'info';

  const { data: doc, isLoading, error } = useQuery<DocumentRead>({
    queryKey: ['document', slug],
    queryFn: async () => {
      const token = await getToken();
      return documentsService.get(slug, token ?? '');
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'pending' || status === 'processing' ? 3000 : false;
    },
  });

  const { data: validity } = useQuery<ValidityRead>({
    queryKey: ['validity', slug],
    queryFn: async () => {
      const token = await getToken();
      return intelligenceService.validity(slug, token ?? '');
    },
    enabled: isAnalyzed(doc?.status),
    retry: false,
  });

  const { data: rejection } = useQuery<RejectionRead>({
    queryKey: ['rejection', slug],
    queryFn: async () => {
      const token = await getToken();
      return intelligenceService.rejection(slug, token ?? '');
    },
    enabled: isAnalyzed(doc?.status),
    retry: false,
  });

  const need = locList(doc?.need, lang);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (need.length > 0 && checkDone.length !== need.length) {
      setCheckDone(new Array(need.length).fill(false));
    }
  }, [need.length]); // intentionally omit checkDone.length to avoid reset loop

  const toggleCheck = useCallback((i: number) => {
    setCheckDone(prev => { const n = [...prev]; n[i] = !n[i]; return n; });
  }, []);

  if (isLoading) return (
    <div style={{ padding: '80px 40px', textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--sh-border)', borderTopColor: 'var(--sh-blue)', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)' }}>Loading document…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !doc) return (
    <div style={{ padding: '80px 40px', textAlign: 'center' }}>
      <p style={{ ...F, fontSize: 20, color: 'var(--sh-danger)', fontWeight: 700 }}>Could not load document</p>
      <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)' }}>{(error as Error)?.message}</p>
      <Link href="/app/documents" style={{ ...F, color: 'var(--sh-blue)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← Back</Link>
    </div>
  );

  const title = loc(doc.title, lang) || doc.docType || 'Document';
  const issuer = loc(doc.issuer, lang);
  const what = loc(doc.what, lang);
  const why = loc(doc.why, lang);
  const explain = loc(doc.explain, lang);
  const where = loc(doc.where, lang);
  const ifNot = loc(doc.ifNot, lang);
  const steps = locList(doc.steps, lang);

  const readText = [what, why, explain, steps.join('. ')].filter(Boolean).join('\n\n');

  return (
    <div style={{ padding: '0 0 64px' }}>
      {/* Header */}
      <div style={{ padding: '20px 40px 18px', borderBottom: '1px solid var(--sh-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: '#fff' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href="/app/documents" style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            My documents
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ ...F, fontSize: 22, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: 0 }}>{title}</h1>
            {validity && <ValidityBadge validity={validity} />}
          </div>
          {issuer && <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: '4px 0 0' }}>{issuer}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          {readText && isAnalyzed(doc.status) && <VoiceButton text={readText} />}
          <LangToggle lang={lang} onChange={setLang} />
        </div>
      </div>

      {/* Processing state */}
      {(doc.status === 'pending' || doc.status === 'processing') && (
        <div style={{ margin: '24px 40px', background: 'var(--sh-soft-blue)', border: '1px solid var(--sh-border)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(21,87,176,0.2)', borderTopColor: 'var(--sh-blue)', flexShrink: 0, animation: 'spin 0.8s linear infinite' }} />
          <div>
            <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-blue)', margin: 0 }}>Analyzing your document…</p>
            <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: 0 }}>This takes 15–30 seconds. The page will refresh automatically.</p>
          </div>
        </div>
      )}

      {doc.status === 'error' && (
        <div style={{ margin: '24px 40px', background: '#FDECEA', border: '1px solid #F5C6C6', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-danger)', margin: 0 }}>Analysis failed. Please try uploading the document again with better lighting.</p>
        </div>
      )}

      {/* Main content */}
      {isAnalyzed(doc.status) && (
        <div style={{ padding: '28px 40px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* Left: Analysis */}
          <div>
            {/* Rejection alert */}
            {rejection && <RejectionAlert rejection={rejection} lang={lang} />}

            {/* Key facts */}
            {(doc.refNo || doc.received || doc.deadline) && (
              <div style={{ background: 'var(--sh-doc)', border: '1px solid #E8DFC0', borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                {doc.refNo && (
                  <div>
                    <p style={{ ...F, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sh-ink-faint)', margin: '0 0 3px' }}>Reference no.</p>
                    <p style={{ ...F, fontSize: 14, fontWeight: 600, color: 'var(--sh-dark-ink)', margin: 0, fontFamily: 'monospace' }}>{doc.refNo}</p>
                  </div>
                )}
                {doc.received && (
                  <div>
                    <p style={{ ...F, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sh-ink-faint)', margin: '0 0 3px' }}>Date issued</p>
                    <p style={{ ...F, fontSize: 14, fontWeight: 600, color: 'var(--sh-dark-ink)', margin: 0 }}>{doc.received}</p>
                  </div>
                )}
                {doc.deadline && (
                  <div>
                    <p style={{ ...F, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#D9972B', margin: '0 0 3px' }}>⏰ Deadline</p>
                    <p style={{ ...F, fontSize: 15, fontWeight: 800, color: '#D9972B', margin: 0 }}>{doc.deadline}</p>
                  </div>
                )}
              </div>
            )}

            {what && <Section title="What is this document?"><Prose text={what} /></Section>}
            {why && <Section title="Why did you receive this?"><Prose text={why} /></Section>}
            {explain && <Section title="What does it mean?"><Prose text={explain} /></Section>}

            {steps.length > 0 && (
              <Section title="What you need to do">
                <BulletList items={steps} />
              </Section>
            )}

            {need.length > 0 && (
              <Section title="Documents you may need — tick off as you gather them">
                <Checklist
                  items={need}
                  done={checkDone.length === need.length ? checkDone : new Array(need.length).fill(false)}
                  onToggle={toggleCheck}
                />
              </Section>
            )}

            {where && (
              <Section title="Where to go">
                <div style={{ background: '#F0FBF5', border: '1px solid #C3E8D4', borderRadius: 10, padding: '14px 18px' }}>
                  <Prose text={where} />
                </div>
              </Section>
            )}

            {ifNot && (
              <Section title="What happens if you don't act">
                <div style={{ background: '#FFF3F3', border: '1px solid #F5C6C6', borderRadius: 10, padding: '14px 18px' }}>
                  <Prose text={ifNot} />
                </div>
              </Section>
            )}

            {/* Personal data — masked sensitive fields */}
            {doc.personal && Object.keys(doc.personal).length > 0 && (
              <Section title="Your information in this document">
                <div style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 10, overflow: 'hidden' }}>
                  {Object.entries(doc.personal).map(([k, v], i, arr) => {
                    const sensitive = k.toLowerCase().includes('number') || k.toLowerCase().includes('aadhaar') || k.toLowerCase().includes('pan');
                    const masked = sensitive && String(v).length > 5
                      ? String(v).slice(0, 2) + '•'.repeat(Math.max(0, String(v).length - 4)) + String(v).slice(-2)
                      : String(v);
                    return (
                      <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', borderBottom: i < arr.length - 1 ? '1px solid var(--sh-border)' : 'none', padding: '10px 16px' }}>
                        <span style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', fontWeight: 500 }}>{k}</span>
                        <span style={{ ...F, fontSize: 13, color: 'var(--sh-dark-ink)', fontWeight: 600, fontFamily: 'monospace' }}>{masked}</span>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* FAQ pairs */}
            {doc.pairs && doc.pairs.length > 0 && (
              <Section title="Common questions about this document">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {doc.pairs.map((p, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 10, padding: '14px 16px' }}>
                      <p style={{ ...F, fontSize: 14, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 6px' }}>{loc(p.q, lang)}</p>
                      <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', lineHeight: 1.65, margin: 0 }}>{loc(p.a, lang)}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Gov refs */}
            {doc.gov && doc.gov.length > 0 && (
              <Section title="Referenced laws & orders">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {doc.gov.map(g => (
                    <span key={g} style={{ ...F, fontSize: 12, background: 'var(--sh-bg)', border: '1px solid var(--sh-border)', borderRadius: 6, padding: '4px 10px', color: 'var(--sh-ink-muted)' }}>{g}</span>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Right: Chat + quick links */}
          <div style={{ position: 'sticky', top: 16 }}>
            <ChatPanel documentId={doc.id} lang={lang} />
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Link href="/app/schemes" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 8, padding: '10px', textDecoration: 'none', ...F, fontSize: 13, fontWeight: 600, color: 'var(--sh-dark-ink)' }}>
                ⭐ Schemes
              </Link>
              <Link href="/app/services" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 8, padding: '10px', textDecoration: 'none', ...F, fontSize: 13, fontWeight: 600, color: 'var(--sh-dark-ink)' }}>
                📍 Mee Seva
              </Link>
              <Link href="/app/chat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 8, padding: '10px', textDecoration: 'none', ...F, fontSize: 13, fontWeight: 600, color: 'var(--sh-dark-ink)', gridColumn: '1/-1' }}>
                💬 Open full AI chat
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
