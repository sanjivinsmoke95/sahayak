import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'How Sahayak Works' };

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

export default function HowItWorksPage() {
  return (
    <div style={{ ...F, background: '#FAFBFF', color: '#0D1B3E', minHeight: '100dvh' }}>
      <style>{`
        * { box-sizing: border-box; }
        .glass-card { background: rgba(255,255,255,0.6); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.75); border-radius: 14px; box-shadow: 0 4px 20px rgba(23,58,120,0.07); }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,251,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(23,58,120,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/v2-assets/logo-mark.svg" alt="Sahayak" width={34} height={34} />
            <div style={{ fontWeight: 800, fontSize: 18, color: '#173A78' }}>Sahayak</div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>Home</Link>
            <Link href="/features" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>Features</Link>
            <Link href="/impact" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>Impact</Link>
            <Link href="/about" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>About</Link>
            <Link href="/app/dashboard" style={{ fontSize: 14, fontWeight: 700, color: 'white', background: '#173A78', borderRadius: 8, padding: '9px 18px', textDecoration: 'none' }}>Try it</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #EEF3FB 0%, #FAFBFF 100%)', padding: '72px 28px 56px', textAlign: 'center' }}>
        <div style={{ height: 3, background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33%, #fff 66.66%, #138808 66.66%)', marginBottom: 40 }} />
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>HOW IT WORKS</p>
        <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.15, marginBottom: 18, maxWidth: 640, margin: '0 auto 18px', letterSpacing: '-0.025em' }}>
          From a complicated document to clear next steps
        </h1>
        <p style={{ fontSize: 16, color: '#546A8C', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Sahayak uses AI, OCR, and a database of 3,397 government schemes to turn any official document into an actionable, plain-language summary.
        </p>
        <Link href="/app/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#173A78', color: 'white', borderRadius: 10, padding: '13px 26px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(23,58,120,0.3)' }}>
          Try it now — free
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </section>

      {/* Steps */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 28px' }}>
        {[
          {
            n: '01', icon: '📤', title: 'Upload your document',
            body: 'Take a clear photo with your phone, or upload a scanned PDF. Sahayak accepts JPG, PNG, WebP, and PDF files up to 15 MB. Your document is encrypted in transit and at rest.',
            detail: ['Works with phones and cameras', 'Accepts scans and photos', 'Supports PDFs up to 15 MB', 'End-to-end encrypted'],
            img: '/assets/01_government_document.png',
          },
          {
            n: '02', icon: '🔍', title: 'AI reads and analyses it',
            body: 'Sahayak uses optical character recognition (OCR) to extract all text, then a large language model identifies the document type, the issuing authority, key dates, and the action required.',
            detail: ['OCR for photos and scans', 'Document type classification', 'Date and deadline extraction', 'Action identification'],
            img: '/assets/09_supporting_workflow_illustration.png',
          },
          {
            n: '03', icon: '💡', title: 'Get a plain-language summary',
            body: 'You receive a structured explanation: what the document is, why you received it, what you need to do, and by when — in English, Hindi, or Telugu. A text-to-speech button reads it aloud.',
            detail: ['Simple English / Hindi / Telugu', 'What · Why · Steps · Deadline', 'Text-to-speech read-aloud', 'Confidence score shown'],
            img: '/assets/02_mobile_app_mockup.png',
          },
          {
            n: '04', icon: '✅', title: 'Find next steps and nearby help',
            body: 'Sahayak matches your document against 3,397 government schemes you might be eligible for, and shows Mee Seva centres near you on a map when you need in-person assistance.',
            detail: ['3,397 schemes checked', 'Mee Seva centre locator', 'Eligibility checker', 'Scheme application guidance'],
            img: '/assets/06_feature_icons.png',
          },
        ].map((step, i) => (
          <div key={step.n} style={{ display: 'grid', gridTemplateColumns: i % 2 === 0 ? '1fr 380px' : '380px 1fr', gap: 56, alignItems: 'center', marginBottom: 80 }}>
            {i % 2 !== 0 && (
              <div style={{ borderRadius: 18, overflow: 'hidden', background: '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
                <Image src={step.img} alt="" width={340} height={300} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{step.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: '#1557B0' }}>{step.n}</div>
              </div>
              <h2 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 800, color: '#0D1B3E', marginBottom: 14, lineHeight: 1.25 }}>{step.title}</h2>
              <p style={{ fontSize: 15, color: '#546A8C', lineHeight: 1.7, marginBottom: 20 }}>{step.body}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {step.detail.map(d => (
                  <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#2D4070', fontWeight: 500 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: '#E8F0FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3L9 1" stroke="#1557B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    {d}
                  </div>
                ))}
              </div>
            </div>
            {i % 2 === 0 && (
              <div style={{ borderRadius: 18, overflow: 'hidden', background: '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
                <Image src={step.img} alt="" width={340} height={300} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Tech stack callout */}
      <section style={{ background: '#EBF2FF', padding: '56px 28px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>UNDER THE HOOD</p>
          <h2 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 800, color: '#0D1B3E', marginBottom: 28 }}>How we built Sahayak</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 14 }}>
            {[
              { icon: '🤖', label: 'AI analysis', detail: 'Claude for document understanding' },
              { icon: '🔤', label: 'OCR', detail: 'Text extraction from photos & PDFs' },
              { icon: '🗄️', label: 'Schemes DB', detail: '3,397 schemes in PostgreSQL' },
              { icon: '🌐', label: 'Multilingual', detail: 'English, Hindi, Telugu' },
              { icon: '🔒', label: 'Private', detail: 'Encrypted storage, no sharing' },
              { icon: '⚡', label: 'Fast', detail: 'Results in under 30 seconds' },
            ].map(t => (
              <div key={t.label} className="glass-card" style={{ padding: '18px 16px' }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{t.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0D1B3E', marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: '#7A90B4' }}>{t.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#173A78', padding: '64px 28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: 'white', marginBottom: 14 }}>Ready to try it?</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 30, maxWidth: 480, margin: '0 auto 30px' }}>Upload any government document and Sahayak will explain it in plain language — free, in seconds.</p>
        <Link href="/app/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#173A78', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Upload a document
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#173A78" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0D1B3E', padding: '32px 28px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          &copy; 2026 Sahayak &nbsp;·&nbsp;
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Home</Link> &nbsp;·&nbsp;
          <Link href="/features" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Features</Link> &nbsp;·&nbsp;
          <Link href="/about" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>About</Link>
        </p>
      </footer>
    </div>
  );
}
