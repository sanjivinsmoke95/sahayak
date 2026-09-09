import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sahayak — Government documents, made simple',
};

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

export default function HomePage() {
  return (
    <div style={{ ...F, background: 'var(--sh-bg)', color: 'var(--sh-ink)', minHeight: '100dvh' }}>
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(244,248,252,0.88)',
          borderBottom: '1px solid var(--sh-border)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#1557B0" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="24" cy="22" r="4" fill="#F59E0B" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--sh-deep-navy)', letterSpacing: '-0.02em' }}>Sahayak</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/how-it-works" style={{ padding: '8px 14px', fontSize: 14, fontWeight: 500, color: 'var(--sh-ink-muted)', textDecoration: 'none', borderRadius: 8 }}>How it works</Link>
            <Link href="/features" style={{ padding: '8px 14px', fontSize: 14, fontWeight: 500, color: 'var(--sh-ink-muted)', textDecoration: 'none', borderRadius: 8 }}>Features</Link>
            <Link href="/app/dashboard" style={{
              marginLeft: 8, padding: '9px 20px',
              background: 'var(--sh-blue)', color: 'white',
              borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(21,87,176,0.25)',
            }}>Open app</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #092B5A 0%, #1557B0 55%, #0D3A7A 100%)', padding: '88px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Tricolor stripe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33%, #fff 66.66%, #138808 66.66%)' }} />
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(96,165,250,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, padding: '6px 14px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Free for all citizens</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
            Government documents<br />
            <span style={{ color: '#93C5FD' }}>shouldn&apos;t need a lawyer</span><br />
            to understand.
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Upload any government document. Sahayak explains what it is, why you received it, what the key dates are, and exactly what you need to do — in English, Hindi, or Telugu.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/app/dashboard" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'white', color: 'var(--sh-blue)',
              borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2.25v13.5M2.25 9h13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              Upload a document free
            </Link>
            <Link href="/how-it-works" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.1)', color: 'white',
              border: '1.5px solid rgba(255,255,255,0.25)',
              borderRadius: 10, padding: '14px 24px', fontSize: 15, fontWeight: 600,
              textDecoration: 'none',
            }}>
              See how it works
            </Link>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>No sign-up needed to try · Works on any device · Free forever for citizens</p>
        </div>
      </section>

      {/* ── Problem strip ───────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sh-blue)', marginBottom: 16 }}>The problem</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 auto 48px', maxWidth: 680, lineHeight: 1.25 }}>
            Every year, millions of citizens miss deadlines because they didn&apos;t understand a letter.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { n: '73%', t: 'of rural citizens say they cannot fully understand government letters they receive', c: '#EBF4FF', ink: '#1557B0' },
              { n: '2.4 Cr', t: 'eligible citizens do not claim welfare benefits they are entitled to each year', c: '#E8F7F0', ink: '#2E8B67' },
              { n: '₹18,000', t: 'average cost of hiring help to understand a legal or government document', c: '#FFF8EC', ink: '#D9972B' },
            ].map(s => (
              <div key={s.n} style={{ background: s.c, borderRadius: 12, padding: '28px 24px' }}>
                <p style={{ fontSize: 40, fontWeight: 800, color: s.ink, margin: '0 0 8px' }}>{s.n}</p>
                <p style={{ fontSize: 14, color: 'var(--sh-ink-muted)', lineHeight: 1.5, margin: 0 }}>{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section style={{ background: 'var(--sh-bg)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sh-blue)', marginBottom: 12 }}>How it works</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 auto 56px', maxWidth: 560 }}>
            From document to action plan in minutes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { n: '01', title: 'Upload', body: 'Take a photo or upload a scanned PDF of any government document.', icon: '📤' },
              { n: '02', title: 'AI reads it', body: 'Sahayak identifies the document type and extracts key information.', icon: '🔍' },
              { n: '03', title: 'Plain explanation', body: 'Get a clear explanation in English, Hindi, or Telugu — no jargon.', icon: '💡' },
              { n: '04', title: 'Know what to do', body: 'See the required actions, deadlines, and exactly where to go.', icon: '✅' },
            ].map(s => (
              <div key={s.n} style={{ background: '#fff', border: '1px solid var(--sh-border)', borderRadius: 12, padding: '28px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--sh-blue)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.n}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 8px' }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--sh-ink-muted)', lineHeight: 1.55, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sh-blue)', marginBottom: 12 }}>Capabilities</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: 'var(--sh-dark-ink)', margin: '0 auto 52px', maxWidth: 520 }}>
            Everything you need to understand and act on any government document
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { icon: '📄', title: 'Document analysis', body: 'Instant structured explanation: what it is, who issued it, and what it means for you.', color: '#EBF4FF', ink: '#1557B0' },
              { icon: '🌐', title: 'Three languages', body: 'Switch between English, Hindi, and Telugu at any time without re-uploading.', color: '#E8F7F0', ink: '#2E8B67' },
              { icon: '💬', title: 'AI assistant', body: 'Ask follow-up questions in plain language. Answers are grounded in your document.', color: '#F1ECFB', ink: '#6B4EE6' },
              { icon: '🏦', title: 'Scheme matching', body: 'See which government welfare schemes you may be eligible for based on your documents.', color: '#EBF4FF', ink: '#1557B0' },
              { icon: '📍', title: 'Mee Seva finder', body: 'View nearby Mee Seva centres on a map when in-person assistance is needed.', color: '#E8F7F0', ink: '#2E8B67' },
              { icon: '⏰', title: 'Deadline tracking', body: 'Key dates and required actions are extracted and highlighted clearly.', color: '#FFF8EC', ink: '#D9972B' },
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', gap: 16, padding: '20px', borderRadius: 12, border: '1px solid var(--sh-border)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--sh-dark-ink)', margin: '0 0 6px' }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: 'var(--sh-ink-muted)', lineHeight: 1.55, margin: 0 }}>{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Multilingual strip ──────────────────────────────────── */}
      <section style={{ background: 'var(--sh-deep-navy)', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93C5FD', marginBottom: 12 }}>Language</p>
        <h2 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: '#fff', margin: '0 auto 16px', maxWidth: 560 }}>
          Works in three languages
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '0 auto 40px', maxWidth: 480 }}>
          Switch at any time. The same document, explained in the language you&apos;re most comfortable with.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { code: 'EN', name: 'English', sample: 'This is an income certificate issued by the Tahsildar.' },
            { code: 'हिं', name: 'हिंदी', sample: 'यह तहसीलदार द्वारा जारी आय प्रमाण पत्र है।' },
            { code: 'తె', name: 'తెలుగు', sample: 'ఇది తహసీల్దార్ జారీ చేసిన ఆదాయ ధ్రువీకరణ పత్రం.' },
          ].map(l => (
            <div key={l.code} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '20px 24px', maxWidth: 280, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 8, background: '#1557B0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>{l.code}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{l.name}</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, margin: 0 }}>{l.sample}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: 'var(--sh-deep-navy)', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
          Try it now — free.
        </h2>
        <p style={{ fontSize: 17, color: 'var(--sh-ink-muted)', margin: '0 auto 36px', maxWidth: 440, lineHeight: 1.6 }}>
          Upload any government document and Sahayak will explain it in plain language — in under a minute.
        </p>
        <Link href="/app/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'var(--sh-blue)', color: 'white',
          borderRadius: 10, padding: '16px 32px', fontSize: 16, fontWeight: 700,
          textDecoration: 'none', boxShadow: '0 4px 20px rgba(21,87,176,0.3)',
        }}>
          Upload a document
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--sh-ink-faint)' }}>No account required · Works with photos, scans, and PDFs</p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--sh-deep-navy)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 40, justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#1557B0" /><path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.2" strokeLinecap="round" /></svg>
                <span style={{ fontWeight: 800, fontSize: 17, color: 'white' }}>Sahayak</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', maxWidth: 240, lineHeight: 1.5, margin: 0 }}>
                Government documents, explained in plain language. Free for citizens.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Product</p>
                {['How it works', 'Features', 'Impact'].map(l => (
                  <div key={l} style={{ marginBottom: 8 }}>
                    <Link href={`/${l.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>{l}</Link>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>App</p>
                {[['Dashboard', '/app/dashboard'], ['Documents', '/app/documents'], ['AI Chat', '/app/chat'], ['Schemes', '/app/schemes']].map(([l, h]) => (
                  <div key={l} style={{ marginBottom: 8 }}>
                    <Link href={h} style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}>{l}</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 24 }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: 0 }}>
            &copy; {new Date().getFullYear()} Sahayak. Built for Indian citizens.
          </p>
        </div>
      </footer>
    </div>
  );
}
