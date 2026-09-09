'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthToken } from '@/hooks';
import { documentsService } from '@/lib/sahayak/documents';
import { toast } from 'sonner';
import type { FileRead } from '@/lib/sahayak/types';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;
const ACCEPT = '.jpg,.jpeg,.png,.heic,.heif,.pdf,.webp';
const MAX_MB = 25;

export default function UploadPage() {
  const getToken = useAuthToken();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<'idle' | 'uploading' | 'analyzing'>('idle');
  const [progress, setProgress] = useState(0);

  function pickFile(f: File) {
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large — maximum size is ${MAX_MB} MB`);
      return;
    }
    setFile(f);
  }

  async function handleSubmit() {
    if (!file) return;
    try {
      setStage('uploading');
      setProgress(30);
      const token = (await getToken()) ?? '';
      const uploaded: FileRead = await documentsService.upload(file, token);
      setProgress(60);
      setStage('analyzing');
      const doc = await documentsService.analyze({ fileId: uploaded.id, fileName: file.name }, token);
      setProgress(100);
      toast.success('Document analyzed!');
      router.push(`/app/documents/${doc.id}`);
    } catch (err: unknown) {
      setStage('idle');
      setProgress(0);
      toast.error((err as Error).message ?? 'Upload failed. Please try again.');
    }
  }

  const busy = stage !== 'idle';

  return (
    <div style={{ padding: '0 0 48px' }}>
      {/* Header */}
      <div style={{ padding: '32px 40px 24px', borderBottom: '1px solid var(--sh-border)' }}>
        <h1 style={{ ...F, fontSize: 24, fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>Upload document</h1>
        <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: 0 }}>Upload any government document — certificate, notice, order, or letter.</p>
      </div>

      <div style={{ padding: '40px', maxWidth: 640 }}>
        {/* Drop zone */}
        <div
          onClick={() => !busy && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) pickFile(f); }}
          style={{
            border: `2px dashed ${dragging ? 'var(--sh-blue)' : file ? '#2E8B67' : 'var(--sh-border-strong)'}`,
            borderRadius: 16, padding: '48px 32px',
            background: dragging ? 'var(--sh-soft-blue)' : file ? '#F0FBF5' : '#fff',
            textAlign: 'center', cursor: busy ? 'default' : 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <input ref={inputRef} type="file" accept={ACCEPT} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />

          {file ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <p style={{ ...F, fontSize: 16, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 4px' }}>{file.name}</p>
              <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', margin: 0 }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              {!busy && (
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); }}
                  style={{ ...F, marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--sh-danger)', fontWeight: 600 }}
                >
                  Remove
                </button>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📤</div>
              <p style={{ ...F, fontSize: 16, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 8px' }}>
                {dragging ? 'Drop it here' : 'Drag & drop or click to upload'}
              </p>
              <p style={{ ...F, fontSize: 14, color: 'var(--sh-ink-muted)', margin: '0 0 16px' }}>
                JPG, PNG, HEIC, PDF up to {MAX_MB} MB
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['Photo of a document', 'Scanned PDF', 'Screenshot', 'Any image file'].map(t => (
                  <span key={t} style={{ ...F, fontSize: 12, background: 'var(--sh-soft-blue)', color: 'var(--sh-blue)', borderRadius: 6, padding: '4px 10px', fontWeight: 500 }}>{t}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Progress */}
        {busy && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ ...F, fontSize: 13, fontWeight: 600, color: 'var(--sh-dark-ink)' }}>
                {stage === 'uploading' ? 'Uploading…' : 'Analyzing document with AI…'}
              </span>
              <span style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)' }}>{progress}%</span>
            </div>
            <div style={{ height: 6, background: 'var(--sh-border)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'var(--sh-blue)', borderRadius: 999, transition: 'width 0.4s ease' }} />
            </div>
            <p style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', marginTop: 8 }}>
              {stage === 'analyzing' ? 'This takes about 15–30 seconds. Please wait.' : ''}
            </p>
          </div>
        )}

        {/* Submit */}
        {!busy && (
          <button
            onClick={handleSubmit}
            disabled={!file}
            style={{
              ...F, width: '100%', marginTop: 20,
              background: file ? 'var(--sh-blue)' : '#CBD5E1',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '14px', fontSize: 15, fontWeight: 700,
              cursor: file ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
          >
            Analyze document
          </button>
        )}

        {/* Tips */}
        <div style={{ marginTop: 32, background: 'var(--sh-soft-blue)', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ ...F, fontSize: 13, fontWeight: 700, color: 'var(--sh-blue)', margin: '0 0 12px' }}>For best results</p>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {[
              'Ensure the full document is in the frame — all four corners visible',
              'Good lighting helps — avoid glare and shadows',
              'Supported: income certificates, notices, orders, ration cards, land records, and more',
              'Documents in Telugu, Hindi, and English all work',
            ].map(t => (
              <li key={t} style={{ ...F, fontSize: 13, color: 'var(--sh-ink-muted)', marginBottom: 6, lineHeight: 1.5 }}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
