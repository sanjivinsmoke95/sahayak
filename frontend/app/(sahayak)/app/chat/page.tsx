'use client';

import { useState } from 'react';
import { useAuthToken } from '@/hooks';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/lib/sahayak/ai';
import { toast } from 'sonner';
import type { AskResponse, Lang } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

type Message = { role: 'user' | 'assistant'; content: string; list?: string[]; grounded?: boolean };

const SUGGESTED = [
  'What documents do I need for a ration card?',
  'How do I renew my income certificate?',
  'What government schemes am I eligible for?',
  'Where is the nearest Mee Seva centre?',
  'What is the deadline for property tax payment?',
];

function LangPill({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--sh-bg)', borderRadius: 8, padding: 3 }}>
      {(['en', 'hi', 'te'] as Lang[]).map(l => (
        <button key={l} onClick={() => onChange(l)} style={{
          ...F, border: 'none', cursor: 'pointer', borderRadius: 6, padding: '5px 12px',
          fontSize: 12, fontWeight: lang === l ? 700 : 500,
          background: lang === l ? 'var(--sh-blue)' : 'transparent',
          color: lang === l ? 'white' : 'var(--sh-ink-muted)',
          transition: 'all 0.15s',
        }}>
          {l === 'en' ? 'EN' : l === 'hi' ? 'हिं' : 'తె'}
        </button>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const getToken = useAuthToken();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<Lang>('en');

  const { mutate: ask, isPending } = useMutation({
    mutationFn: async (question: string) => {
      const token = (await getToken()) ?? '';
      return aiService.ask({
        question, lang,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      }, token);
    },
    onMutate: (question) => {
      setMessages(prev => [...prev, { role: 'user', content: question }]);
      setInput('');
    },
    onSuccess: (data: AskResponse) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.text, list: data.list ?? [], grounded: data.grounded }]);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  function send(q?: string) {
    const question = (q ?? input).trim();
    if (!question || isPending) return;
    ask(question);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Header */}
      <div style={{ padding: '24px 40px 20px', borderBottom: '1px solid var(--sh-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ ...F, fontSize: 22, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 3px' }}>AI assistant</h1>
          <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: 0 }}>Ask anything about government documents, schemes, and services</p>
        </div>
        <LangPill lang={lang} onChange={setLang} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
            <h2 style={{ ...F, fontSize: 20, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 10px' }}>
              Ask Sahayak anything
            </h2>
            <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: '0 0 32px', lineHeight: 1.6 }}>
              I can help with government documents, welfare schemes, office locations, required forms, and more.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTED.map(q => (
                <button key={q} onClick={() => send(q)} style={{
                  ...F, background: '#fff', border: '1px solid var(--sh-border)',
                  borderRadius: 10, padding: '12px 16px', fontSize: 14, fontWeight: 500,
                  color: 'var(--sh-dark-ink)', cursor: 'pointer', textAlign: 'left',
                  transition: 'border-color 0.15s',
                }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sh-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 10, alignSelf: 'flex-end' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1.5" /><path d="M5 8h6M8 5v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </div>
            )}
            <div style={{
              maxWidth: '70%',
              background: m.role === 'user' ? 'var(--sh-blue)' : '#fff',
              color: m.role === 'user' ? 'white' : 'var(--sh-dark-ink)',
              borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              border: m.role === 'assistant' ? '1px solid var(--sh-border)' : 'none',
              padding: '12px 16px', ...F, fontSize: 14, lineHeight: 1.65,
            }}>
              <p style={{ margin: 0 }}>{m.content}</p>
              {m.list && m.list.length > 0 && (
                <ul style={{ margin: '10px 0 0', paddingLeft: 16 }}>
                  {m.list.map((item, j) => <li key={j} style={{ marginBottom: 5 }}>{item}</li>)}
                </ul>
              )}
              {m.grounded && m.role === 'assistant' && (
                <p style={{ ...F, fontSize: 11, color: 'var(--sh-success)', margin: '8px 0 0', fontWeight: 600 }}>✓ Grounded in official sources</p>
              )}
            </div>
          </div>
        ))}

        {isPending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sh-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1.5" /></svg>
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: '14px 14px 14px 4px', padding: '12px 18px', display: 'inline-flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sh-ink-faint)', display: 'inline-block', animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '16px 40px 24px', borderTop: '1px solid var(--sh-border)', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, maxWidth: 800 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type your question…"
            style={{ ...F, flex: 1, border: '1.5px solid var(--sh-border)', borderRadius: 10, padding: '12px 16px', fontSize: 15, color: 'var(--sh-ink)', background: '#fff', outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e => { e.target.style.borderColor = 'var(--sh-blue)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--sh-border)'; }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || isPending}
            style={{ background: input.trim() && !isPending ? 'var(--sh-blue)' : '#CBD5E1', border: 'none', borderRadius: 10, padding: '0 20px', cursor: input.trim() && !isPending ? 'pointer' : 'not-allowed', color: 'white', transition: 'background 0.15s' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17.5 10L2.5 4.167L6.667 10L2.5 15.833L17.5 10Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
        <p style={{ ...F, fontSize: 12, color: 'var(--sh-ink-faint)', margin: '8px 0 0' }}>
          AI responses are for information only — always verify important decisions with the issuing authority.
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
