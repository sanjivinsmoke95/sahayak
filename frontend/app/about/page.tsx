import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About Sahayak' };

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

export default function AboutPage() {
  return (
    <div style={{ ...F, background: '#FAFBFF', color: '#0D1B3E', minHeight: '100dvh' }}>
      <style>{`
        * { box-sizing: border-box; }
        .glass-card { background: rgba(255,255,255,0.6); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.75); border-radius: 16px; box-shadow: 0 4px 20px rgba(23,58,120,0.07); }
      `}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,251,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(23,58,120,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/v2-assets/logo-mark.svg" alt="Sahayak" width={34} height={34} />
            <div style={{ fontWeight: 800, fontSize: 18, color: '#173A78' }}>Sahayak</div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>Home</Link>
            <Link href="/how-it-works" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>How it works</Link>
            <Link href="/features" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>Features</Link>
            <Link href="/impact" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>Impact</Link>
            <Link href="/app/dashboard" style={{ fontSize: 14, fontWeight: 700, color: 'white', background: '#173A78', borderRadius: 8, padding: '9px 18px', textDecoration: 'none' }}>Try it</Link>
          </div>
        </div>
      </nav>

      {/* Mission */}
      <section style={{ background: 'linear-gradient(180deg, #EEF3FB 0%, #FAFBFF 100%)', padding: '80px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>ABOUT SAHAYAK</p>
          <h1 style={{ fontSize: 'clamp(30px,4.5vw,52px)', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}>
            Government documents,<br />
            <span style={{ color: '#1557B0' }}>made simple.</span>
          </h1>
          <p style={{ fontSize: 17, color: '#546A8C', lineHeight: 1.75, maxWidth: 660, marginBottom: 20 }}>
            Sahayak (&ldquo;helper&rdquo; in Hindi) was built because too many Indian citizens receive important government documents that they cannot understand — not because they&apos;re uneducated, but because the language of government has always been a barrier.
          </p>
          <p style={{ fontSize: 17, color: '#546A8C', lineHeight: 1.75, maxWidth: 660 }}>
            We believe that access to information is the foundation of a functioning democracy. When you understand what a notice means, when you know your rights and your next steps, you can act — and that matters.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 28px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>OUR VALUES</p>
        <h2 style={{ fontSize: 'clamp(22px,2.8vw,32px)', fontWeight: 800, color: '#0D1B3E', marginBottom: 32 }}>What guides everything we build</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {[
            { icon: '🌍', title: 'Inclusive by default', body: 'Sahayak is designed for citizens who may not be tech-savvy, may not speak English, or may have limited literacy. Every design decision starts there.' },
            { icon: '🔒', title: 'Privacy first', body: 'Your documents contain sensitive personal information. We encrypt them end-to-end, never share them, and let you delete them at any time.' },
            { icon: '🤝', title: 'Accuracy over speed', body: 'We\'d rather tell you "we\'re not sure" than give you a wrong answer about a government notice that could have legal consequences.' },
            { icon: '🌐', title: 'Language is access', body: 'Hindi and Telugu are first-class citizens alongside English. Not afterthoughts, not machine-translated footers — full, reviewed translations throughout.' },
            { icon: '📊', title: 'Open about limitations', body: 'We show confidence scores on every extraction. We mark documents as "needs review" when analysis quality is uncertain. We don\'t hide what we don\'t know.' },
            { icon: '🇮🇳', title: 'Built for India', body: 'The schemes database, the document categories, the languages, the Mee Seva integration — everything is designed specifically for the Indian context.' },
          ].map(v => (
            <div key={v.title} className="glass-card" style={{ padding: '24px 20px' }}>
              <div style={{ fontSize: 30, marginBottom: 12 }}>{v.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0D1B3E', marginBottom: 8 }}>{v.title}</div>
              <p style={{ fontSize: 13, color: '#546A8C', lineHeight: 1.65 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section style={{ background: '#EBF2FF', padding: '72px 28px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>TECHNOLOGY</p>
          <h2 style={{ fontSize: 'clamp(22px,2.8vw,32px)', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.3, marginBottom: 20 }}>
            Built with modern open tools —<br />no black boxes.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {[
              { layer: 'Frontend', stack: 'Next.js 14 (App Router) · React 18 · TypeScript · Clerk auth' },
              { layer: 'Backend', stack: 'FastAPI · SQLAlchemy · PostgreSQL · Python 3.12' },
              { layer: 'AI & OCR', stack: 'Claude (Anthropic) for language understanding · OCR for photo extraction' },
              { layer: 'Data', stack: '3,397 scheme records · 10 document categories · 15 scheme categories' },
              { layer: 'Security', stack: 'AES-256 encryption at rest · TLS in transit · Clerk JWT auth' },
              { layer: 'Maps', stack: 'Google Maps Places API · Mee Seva centre location data' },
            ].map(t => (
              <div key={t.layer} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: 12, padding: '16px 18px', backdropFilter: 'blur(12px)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 6 }}>{t.layer}</div>
                <div style={{ fontSize: 13, color: '#2D4070', lineHeight: 1.6 }}>{t.stack}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin / story */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '72px 28px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>THE STORY</p>
        <h2 style={{ fontSize: 'clamp(22px,2.8vw,32px)', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.3, marginBottom: 20 }}>
          Why Sahayak exists
        </h2>
        <p style={{ fontSize: 16, color: '#546A8C', lineHeight: 1.8, marginBottom: 18 }}>
          The idea for Sahayak came from a straightforward observation: most people, when they receive an official notice, put it aside — not because they don&apos;t care, but because they don&apos;t understand it and don&apos;t know where to start.
        </p>
        <p style={{ fontSize: 16, color: '#546A8C', lineHeight: 1.8, marginBottom: 18 }}>
          The document itself is rarely the barrier. Understanding what it asks of you — what to do, by when, where to go — is the barrier. And that&apos;s a problem that AI can actually solve, if it&apos;s designed with the right values: accuracy, honesty, and accessibility first.
        </p>
        <p style={{ fontSize: 16, color: '#546A8C', lineHeight: 1.8 }}>
          Sahayak is the result of that conviction — a platform that treats every citizen as someone who deserves to understand their own government.
        </p>
      </section>

      {/* CTA */}
      <section style={{ background: '#173A78', padding: '64px 28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: 'white', marginBottom: 14 }}>Start using Sahayak today</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 30, maxWidth: 480, margin: '0 auto 30px' }}>Free, private, and built for every Indian citizen.</p>
        <Link href="/app/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#173A78', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Upload your first document
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#173A78" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </section>

      <footer style={{ background: '#0D1B3E', padding: '32px 28px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          &copy; 2026 Sahayak &nbsp;·&nbsp;
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Home</Link> &nbsp;·&nbsp;
          <Link href="/features" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Features</Link> &nbsp;·&nbsp;
          <Link href="/impact" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Impact</Link>
        </p>
      </footer>
    </div>
  );
}
