import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sahayak Impact' };

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

async function getStats() {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/public/stats`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) throw new Error('unavailable');
    return await res.json() as {
      schemes_total: number; scheme_categories: number;
      documents_total: number; documents_analyzed: number; languages: number;
    };
  } catch {
    return { schemes_total: 3397, scheme_categories: 15, documents_total: 74, documents_analyzed: 68, languages: 3 };
  }
}

export default async function ImpactPage() {
  const stats = await getStats();

  return (
    <div style={{ ...F, background: '#FAFBFF', color: '#0D1B3E', minHeight: '100dvh' }}>
      <style>{`
        * { box-sizing: border-box; }
        .glass-card { background: rgba(255,255,255,0.6); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.75); border-radius: 16px; box-shadow: 0 4px 20px rgba(23,58,120,0.07); }
        @media(max-width:600px){ .stat-grid { grid-template-columns: repeat(2,1fr) !important; } .story-grid { grid-template-columns: 1fr !important; } }
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
            <Link href="/about" style={{ fontSize: 14, color: '#546A8C', textDecoration: 'none' }}>About</Link>
            <Link href="/app/dashboard" style={{ fontSize: 14, fontWeight: 700, color: 'white', background: '#173A78', borderRadius: 8, padding: '9px 18px', textDecoration: 'none' }}>Try it</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #EEF3FB 0%, #FAFBFF 100%)', padding: '72px 28px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33%, #fff 66.66%, #138808 66.66%)' }} />
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>IMPACT</p>
        <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.025em' }}>
          When citizens understand,<br />
          <span style={{ color: '#1557B0' }}>democracy grows stronger.</span>
        </h1>
        <p style={{ fontSize: 16, color: '#546A8C', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          Sahayak was built on a simple belief: access to information is a right, not a privilege. Here&apos;s what that looks like in numbers.
        </p>
      </section>

      {/* Live stats */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 28px' }}>
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 64 }}>
          {[
            { val: stats.documents_analyzed.toLocaleString() + '+', label: 'Documents Analyzed', sub: 'government documents explained', color: '#1557B0', bg: '#EBF4FF' },
            { val: stats.schemes_total.toLocaleString() + '+', label: 'Schemes Indexed', sub: 'across all major ministries', color: '#1557B0', bg: '#EBF4FF' },
            { val: stats.languages.toString(), label: 'Languages', sub: 'English, Hindi, Telugu', color: '#2E8B67', bg: '#E8F7F0' },
            { val: stats.scheme_categories.toString(), label: 'Scheme Categories', sub: 'from Agriculture to Women & Child', color: '#1557B0', bg: '#EBF4FF' },
          ].map(s => (
            <div key={s.label} className="glass-card" style={{ padding: '28px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.val}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0D1B3E', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#8A9AB8' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Problem statement */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>THE PROBLEM WE&apos;RE SOLVING</p>
            <h2 style={{ fontSize: 'clamp(22px,2.8vw,32px)', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.3, marginBottom: 18 }}>
              300 million people in India can&apos;t read English — yet most government documents are written in it.
            </h2>
            <p style={{ fontSize: 15, color: '#546A8C', lineHeight: 1.7, marginBottom: 16 }}>
              Even educated citizens struggle with the jargon-heavy language of official notices, income certificates, and pension letters. The result: missed deadlines, lost entitlements, and avoidable legal trouble.
            </p>
            <p style={{ fontSize: 15, color: '#546A8C', lineHeight: 1.7 }}>
              Sahayak bridges that gap — not by replacing officials, but by translating what they write into language that every citizen can act on.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <Image src="/assets/10_citizen_illustration.png" alt="Citizen" width={380} height={440} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Stories (illustrative) */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>USE CASES</p>
          <h2 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 800, color: '#0D1B3E', marginBottom: 28 }}>What Sahayak helps people do</h2>
          <div className="story-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              {
                icon: '👨‍🌾', title: 'Subsidy claims', story: 'A farmer receives an Income Certificate from the tehsil office. Sahayak explains that it makes them eligible for PM Kisan Samman Nidhi — ₹6,000 per year — and shows the application steps.',
              },
              {
                icon: '👴', title: 'Pension letters', story: 'A retired government employee receives a letter about a pension revision. Sahayak extracts the new amount, the effective date, and who to contact if the revision doesn\'t appear in the next payment.',
              },
              {
                icon: '🏠', title: 'Property notices', story: 'A family gets a property tax demand notice they don\'t understand. Sahayak shows the amount due, the deadline, the penalty for non-payment, and the nearest Mee Seva centre where they can pay.',
              },
              {
                icon: '📚', title: 'Scholarship eligibility', story: 'A student receives a school leaving certificate. Sahayak matches it against 12 eligible scholarship schemes and flags three with upcoming application deadlines.',
              },
              {
                icon: '🏥', title: 'Health scheme enrollment', story: 'A family receives a ration card renewal notice. Sahayak identifies that the renewal also qualifies them to enroll in Ayushman Bharat and provides the enrollment steps.',
              },
              {
                icon: '⚖️', title: 'Court notices', story: 'A small business owner receives a court summons they can\'t read. Sahayak explains the nature of the notice, the required response date, and the type of lawyer they should consult.',
              },
            ].map(s => (
              <div key={s.title} className="glass-card" style={{ padding: '22px 20px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0D1B3E', marginBottom: 8 }}>{s.title}</div>
                <p style={{ fontSize: 13, color: '#546A8C', lineHeight: 1.65 }}>{s.story}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#173A78', padding: '64px 28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: 'white', marginBottom: 14 }}>Be part of the change</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 30, maxWidth: 480, margin: '0 auto 30px' }}>Upload a document, understand your rights, and take action.</p>
        <Link href="/app/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#173A78', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Try Sahayak free
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#173A78" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </section>

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
