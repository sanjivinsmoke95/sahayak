import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sahayak Features' };

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

async function getStats() {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/public/stats`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error('unavailable');
    return await res.json() as { schemes_total: number; scheme_categories: number; documents_analyzed: number };
  } catch {
    return { schemes_total: 3397, scheme_categories: 15, documents_analyzed: 0 };
  }
}

export default async function FeaturesPage() {
  const stats = await getStats();

  const features = [
    {
      icon: '📄', title: 'Smart Document Analysis', badge: 'Core',
      body: 'Upload any government document — income certificate, property tax notice, pension letter, court summons — and receive a structured breakdown in seconds.',
      bullets: ['Identifies document type and issuing authority', 'Extracts reference numbers and dates', 'Flags deadlines and required action', 'Confidence score for every extraction'],
      color: '#EBF4FF', link: '/app/documents',
    },
    {
      icon: '🌐', title: 'Three Languages', badge: 'Accessibility',
      body: 'Switch between English, Hindi, and Telugu at any time. Every explanation, scheme, and step is fully translated — not just the UI.',
      bullets: ['English · हिंदी · తెలుగు', 'Switch without re-uploading', 'AI-generated translations checked for accuracy', 'Read-aloud in all three languages'],
      color: '#E8F7F0', link: '/app/settings',
    },
    {
      icon: '💬', title: 'AI Chat Assistant', badge: 'Intelligence',
      body: 'Ask follow-up questions about any document in plain language. The assistant is grounded in your document — it won\'t hallucinate.',
      bullets: ['Grounded in your document context', 'Cites specific sections when answering', 'Understands follow-up questions', 'Available in all three languages'],
      color: '#F1ECFB', link: '/app/chat',
    },
    {
      icon: '🏛️', title: 'Government Scheme Matching', badge: 'Discovery',
      body: `Sahayak indexes ${stats.schemes_total.toLocaleString()} government schemes across ${stats.scheme_categories} categories. Based on your document's content, it identifies schemes you may be eligible for.`,
      bullets: [`${stats.schemes_total.toLocaleString()} schemes indexed`, `${stats.scheme_categories} categories (Agriculture, Health, Housing…)`, 'Eligibility checker with reason codes', 'Links to official application portals'],
      color: '#EBF4FF', link: '/app/schemes',
    },
    {
      icon: '📍', title: 'Mee Seva Finder', badge: 'Services',
      body: 'When in-person help is needed, Sahayak shows Mee Seva centres and government offices near you on a map, with distance and opening times.',
      bullets: ['Google Maps integration', 'Distance from your location', 'Government offices and Mee Seva', 'Filter by service type'],
      color: '#E8F7F0', link: '/app/services',
    },
    {
      icon: '⏰', title: 'Deadline and Validity Tracking', badge: 'Alerts',
      body: 'Key deadlines extracted from documents are tracked in your Alerts dashboard. You\'ll see upcoming deadlines at a glance and can check document validity status.',
      bullets: ['Deadline tracking dashboard', 'Validity status (valid / expiring / expired)', 'Days-remaining counter', 'Document-by-document view'],
      color: '#FFF8EC', link: '/app/alerts',
    },
    {
      icon: '🔊', title: 'Text-to-Speech', badge: 'Accessibility',
      body: 'Every explanation can be read aloud using your device\'s text-to-speech engine. Useful for users with limited literacy or when hands-free is needed.',
      bullets: ['One-tap read-aloud', 'Works in all three languages', 'Adjustable text size (standard / large / XL)', 'Device TTS — works offline'],
      color: '#F1ECFB', link: '/app/settings',
    },
    {
      icon: '👥', title: 'Family Profiles', badge: 'Households',
      body: 'Manage documents for multiple family members under one account. Documents are tagged to the person they relate to.',
      bullets: ['Add family members with relationship label', 'Documents tagged per-person', 'Useful for elderly parents or children', 'Separate view per profile'],
      color: '#EBF4FF', link: '/app/profiles',
    },
    {
      icon: '🛡️', title: 'Privacy by Design', badge: 'Security',
      body: 'Your documents are encrypted at rest and in transit. Sahayak never shares document contents with third parties without explicit consent.',
      bullets: ['End-to-end encryption', 'No third-party data sharing', 'Sensitive fields masked in logs', 'Documents deletable at any time'],
      color: '#E8F7F0', link: '/app/documents',
    },
  ];

  return (
    <div style={{ ...F, background: '#FAFBFF', color: '#0D1B3E', minHeight: '100dvh' }}>
      <style>{`
        * { box-sizing: border-box; }
        .feature-glass { background: rgba(255,255,255,0.65); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.75); border-radius: 16px; padding: 26px 22px; box-shadow: 0 4px 20px rgba(23,58,120,0.06); transition: box-shadow 0.2s, transform 0.18s; }
        .feature-glass:hover { box-shadow: 0 10px 36px rgba(23,58,120,0.12); transform: translateY(-3px); }
        @media(max-width:700px){ .feat-grid { grid-template-columns: 1fr !important; } }
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
            <Link href="/how-it-works" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>How it works</Link>
            <Link href="/impact" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>Impact</Link>
            <Link href="/about" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>About</Link>
            <Link href="/app/dashboard" style={{ fontSize: 14, fontWeight: 700, color: 'white', background: '#173A78', borderRadius: 8, padding: '9px 18px', textDecoration: 'none' }}>Try it</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #EEF3FB 0%, #FAFBFF 100%)', padding: '72px 28px 56px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>FEATURES</p>
        <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.025em' }}>
          Everything you need to understand<br />any government document
        </h1>
        <p style={{ fontSize: 16, color: '#546A8C', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
          Sahayak is more than a document reader. It&apos;s a complete platform for navigating India&apos;s government processes — in plain language, in your language.
        </p>
      </section>

      {/* Feature grid */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 28px' }}>
        <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {features.map(f => (
            <Link key={f.title} href={f.link} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="feature-glass">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{f.icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#EBF2FF', color: '#1557B0', borderRadius: 6, padding: '3px 8px', letterSpacing: '0.04em' }}>{f.badge}</span>
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0D1B3E', marginBottom: 10, lineHeight: 1.35 }}>{f.title}</h2>
                <p style={{ fontSize: 13, color: '#546A8C', lineHeight: 1.65, marginBottom: 14 }}>{f.body}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {f.bullets.map(b => (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#2D4070', fontWeight: 500 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, background: '#E8F0FB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="7" viewBox="0 0 8 7" fill="none"><path d="M1 3.5l2 2L7 1" stroke="#1557B0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#173A78', padding: '64px 28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: 'white', marginBottom: 14 }}>See all features in action</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 30, maxWidth: 480, margin: '0 auto 30px' }}>Upload your first document and try every feature — free.</p>
        <Link href="/app/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#173A78', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Get started
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#173A78" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </section>

      <footer style={{ background: '#0D1B3E', padding: '32px 28px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          &copy; 2026 Sahayak &nbsp;·&nbsp;
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Home</Link> &nbsp;·&nbsp;
          <Link href="/how-it-works" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>How it works</Link> &nbsp;·&nbsp;
          <Link href="/about" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>About</Link>
        </p>
      </footer>
    </div>
  );
}
