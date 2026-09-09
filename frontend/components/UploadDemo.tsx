'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

export function UploadDemo() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [docId, setDocId] = useState('');
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a JPG, PNG, WebP, or PDF file.');
      setPhase('error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File is too large. Maximum size is 15 MB.');
      setPhase('error');
      return;
    }
    setPhase('uploading');
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/documents/', { method: 'POST', body: form });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { detail?: string }).detail || `Upload failed (${res.status})`);
      }
      const data = await res.json() as { id: string };
      setDocId(data.id);
      setPhase('processing');
      // poll until done
      let attempts = 0;
      const poll = async () => {
        attempts++;
        const r = await fetch(`/api/documents/${data.id}`);
        if (!r.ok) throw new Error('Could not fetch document status');
        const d = await r.json() as { status: string; slug?: string };
        if (d.status === 'done' || d.status === 'info') {
          setPhase('done');
          setTimeout(() => router.push(`/app/documents/${data.id}`), 1200);
        } else if (d.status === 'error') {
          throw new Error('Document analysis failed. Please try another document.');
        } else if (attempts < 30) {
          setTimeout(poll, 2000);
        } else {
          throw new Error('Analysis is taking longer than expected. Open the app to check progress.');
        }
      };
      await poll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setPhase('error');
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div style={{ ...F, maxWidth: 680, margin: '0 auto' }}>
      {/* Drop zone */}
      {(phase === 'idle' || phase === 'error') && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragging ? '#1557B0' : 'rgba(23,58,120,0.25)'}`,
            borderRadius: 18,
            background: dragging ? 'rgba(21,87,176,0.05)' : 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '52px 32px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div style={{ fontSize: 44, marginBottom: 16 }}>📄</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0D1B3E', marginBottom: 8 }}>
            Drop your document here
          </div>
          <div style={{ fontSize: 14, color: '#7A90B4', marginBottom: 20 }}>
            Income certificate, property tax notice, pension letter, Aadhaar letter — any official government document
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#173A78', color: 'white', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v9M5 5l3-3 3 3M3 12h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Choose file
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: '#B0BDD0' }}>JPG · PNG · PDF · up to 15 MB</div>
          {phase === 'error' && (
            <div style={{ marginTop: 16, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#B91C1C', fontWeight: 500 }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Uploading */}
      {phase === 'uploading' && (
        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(23,58,120,0.12)', borderRadius: 18, padding: '52px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>⬆️</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0D1B3E', marginBottom: 8 }}>Uploading your document…</div>
          <ProgressBar />
        </div>
      )}

      {/* Processing */}
      {phase === 'processing' && (
        <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(23,58,120,0.12)', borderRadius: 18, padding: '52px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0D1B3E', marginBottom: 8 }}>Analysing your document…</div>
          <div style={{ fontSize: 13, color: '#7A90B4', marginBottom: 20 }}>
            Reading and extracting information — usually takes 10–30 seconds
          </div>
          <ProgressBar pulsing />
          <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {['Reading text', 'Identifying document type', 'Extracting key dates', 'Finding relevant schemes'].map(s => (
              <span key={s} style={{ fontSize: 12, background: '#EBF2FF', color: '#1557B0', borderRadius: 999, padding: '4px 12px', fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {phase === 'done' && (
        <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(46,139,103,0.25)', borderRadius: 18, padding: '52px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0D1B3E', marginBottom: 8 }}>Analysis complete!</div>
          <div style={{ fontSize: 13, color: '#7A90B4' }}>Opening your document now…</div>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ pulsing }: { pulsing?: boolean }) {
  return (
    <div style={{ height: 6, background: '#EBF2FF', borderRadius: 999, overflow: 'hidden', maxWidth: 280, margin: '0 auto' }}>
      <div style={{
        height: '100%',
        background: '#1557B0',
        borderRadius: 999,
        width: pulsing ? '60%' : '100%',
        animation: pulsing ? 'pulse-width 1.8s ease-in-out infinite' : undefined,
      }} />
      <style>{`@keyframes pulse-width { 0%,100%{width:20%} 50%{width:80%} }`}</style>
    </div>
  );
}
