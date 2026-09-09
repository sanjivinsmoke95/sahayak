import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sahayak — Government documents, made simple',
  description: 'Sahayak helps citizens understand government documents in simple language, identify what action is required, and find the right next steps — in English, Hindi and Telugu.',
};

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

export default function HomePage() {
  return (
    <div style={{ ...F, background: '#FAFBFF', color: '#0D1B3E', minHeight: '100dvh', overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link { color: #4A5568; text-decoration: none; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 8px; transition: color 0.15s; }
        .nav-link:hover { color: #173A78; }
        .nav-link.active { color: #173A78; font-weight: 700; border-bottom: 2px solid #173A78; }
        .try-btn { background: #173A78; color: white; border-radius: 8px; padding: 10px 22px; font-size: 14px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: background 0.15s; }
        .try-btn:hover { background: #0e2a5c; }
        .glass-card { background: rgba(255,255,255,0.55); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.7); border-radius: 14px; box-shadow: 0 8px 32px rgba(23,58,120,0.08), inset 0 1px 0 rgba(255,255,255,0.8); }
        .stat-chip { background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid rgba(23,58,120,0.08); border-radius: 10px; padding: 14px 18px; }
        .step-card { background: #fff; border: 1px solid #E8EDF5; border-radius: 14px; padding: 28px 22px; transition: box-shadow 0.2s; }
        .step-card:hover { box-shadow: 0 8px 24px rgba(23,58,120,0.1); }
        .feature-glass { background: rgba(255,255,255,0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.75); border-radius: 14px; padding: 22px 20px; box-shadow: 0 4px 20px rgba(23,58,120,0.07); transition: box-shadow 0.2s; }
        .feature-glass:hover { box-shadow: 0 8px 32px rgba(23,58,120,0.12); }
        @media(max-width:768px){
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visuals { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .problem-grid { grid-template-columns: 1fr !important; }
          .step-grid { grid-template-columns: repeat(2,1fr) !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
        }
        @media(max-width:480px){
          .stats-grid { grid-template-columns: 1fr !important; }
          .step-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,251,255,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(23,58,120,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/v2-assets/logo-mark.svg" alt="Sahayak" width={34} height={34} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#173A78', letterSpacing: '-0.02em', lineHeight: 1 }}>Sahayak</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#8A9AB8', letterSpacing: '0.02em' }}>Documents to Direction</div>
            </div>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <a href="/" className="nav-link active">Home</a>
            <a href="/how-it-works" className="nav-link">How it works</a>
            <a href="/features" className="nav-link">Features</a>
            <a href="/impact" className="nav-link">Impact</a>
            <a href="/about" className="nav-link">About</a>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #D1DBF0', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#4A5568" strokeWidth="1.2"/><path d="M8 1.5C8 1.5 5.5 4 5.5 8s2.5 6.5 2.5 6.5M8 1.5C8 1.5 10.5 4 10.5 8s-2.5 6.5-2.5 6.5M1.5 8h13" stroke="#4A5568" strokeWidth="1.2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4A5568' }}>EN</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="#4A5568" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            <Link href="/app/dashboard" className="try-btn">
              Try Sahayak
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 4l3.5 3-3.5 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', background: 'linear-gradient(180deg, #EEF3FB 0%, #F5F8FF 60%, #FAFBFF 100%)', overflow: 'hidden', minHeight: 620 }}>
        {/* Background landmark */}
        <div style={{ position: 'absolute', bottom: 0, right: 0, left: 0, height: 320, opacity: 0.18, pointerEvents: 'none' }}>
          <Image src="/assets/14_landmark_line_art.png" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center bottom' }} />
        </div>
        {/* Tricolor stripe */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33%, #fff 66.66%, #138808 66.66%)' }} />

        <div className="hero-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 28px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', position: 'relative', zIndex: 2 }}>
          {/* Left */}
          <div>
            {/* Announcement */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(23,58,120,0.06)', border: '1px solid rgba(23,58,120,0.12)', borderRadius: 999, padding: '6px 14px', marginBottom: 24 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#173A78' }}>A step towards a more informed India</span>
              <Image src="/assets/05_indian_tricolor_accent.png" alt="" width={20} height={14} style={{ objectFit: 'contain' }} />
            </div>

            <h1 style={{ fontSize: 'clamp(32px,3.8vw,50px)', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: 20 }}>
              Government documents<br />
              shouldn&apos;t need a lawyer<br />
              <span style={{ color: '#1557B0' }}>to understand.</span>
            </h1>

            <p style={{ fontSize: 16, color: '#546A8C', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
              Sahayak helps citizens understand government documents in simple language, identify what action is required, and find the right next steps — in English, Hindi and Telugu.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
              <Link href="/app/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#173A78', color: 'white', borderRadius: 10, padding: '13px 26px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(23,58,120,0.3)' }}>
                Try Sahayak
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#173A78', border: '1.5px solid #C8D8F0', borderRadius: 10, padding: '13px 22px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M2 1.5l7 4.5-7 4.5V1.5Z" fill="#1557B0"/></svg>
                </div>
                Watch Demo
              </button>
            </div>

            {/* Feature chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { icon: '📄', text: 'Upload any government document' },
                { icon: '💬', text: 'Get simple explanations' },
                { icon: '📍', text: 'Find schemes & nearby services' },
                { icon: '🌐', text: 'Available in 3 languages' },
              ].map(c => (
                <div key={c.text} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 8 }}>
                  <span style={{ fontSize: 14 }}>{c.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#2D4070' }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visuals */}
          <div className="hero-visuals" style={{ position: 'relative', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Government document */}
            <div style={{ position: 'absolute', left: 0, top: 20, width: 220, transform: 'rotate(-4deg)', zIndex: 1 }}>
              <div className="glass-card" style={{ padding: 6, borderRadius: 14 }}>
                <Image src="/assets/01_government_document.png" alt="Government document" width={210} height={280} style={{ borderRadius: 10, width: '100%', height: 'auto', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Phone mockup */}
            <div style={{ position: 'absolute', right: 20, top: 10, width: 210, zIndex: 3 }}>
              <Image src="/assets/02_mobile_app_mockup.png" alt="Sahayak app" width={210} height={430} style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 20px 40px rgba(23,58,120,0.25))' }} />
            </div>

            {/* Annotation: Same Document → */}
            <div style={{ position: 'absolute', top: 30, right: -10, zIndex: 4, textAlign: 'right' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#173A78', fontStyle: 'italic', lineHeight: 1.4 }}>
                Same Document<br />Clear Answers<br /><strong>Real Impact</strong>
              </div>
              <svg width="40" height="30" viewBox="0 0 40 30" fill="none" style={{ display: 'block', marginLeft: 'auto', marginTop: 4 }}>
                <path d="M38 4 C20 4, 4 15, 4 26" stroke="#173A78" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M0 23 l4 3 2-4" stroke="#173A78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>

            {/* Annotation: Your Documents */}
            <div style={{ position: 'absolute', left: 20, bottom: 30, zIndex: 4 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#173A78', fontStyle: 'italic', lineHeight: 1.5 }}>
                Your Documents<br />Our Support<br /><em>A Brighter Tomorrow</em>
              </div>
            </div>

            {/* Language cards floating */}
            <div style={{ position: 'absolute', right: -20, bottom: 60, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { code: 'EN', label: 'English', sub: 'What should I do?' },
                { code: 'हिं', label: 'हिंदी', sub: 'मुझे क्या करना चाहिए?' },
                { code: 'తె', label: 'తెలుగు', sub: 'నేను ఏమి చేయాలి?' },
              ].map(l => (
                <div key={l.code} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', minWidth: 150 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1557B0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>{l.code}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0D1B3E' }}>{l.label}</div>
                    <div style={{ fontSize: 10, color: '#7A90B4' }}>{l.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', borderTop: '1px solid #EEF2F8', borderBottom: '1px solid #EEF2F8' }}>
        <div className="stats-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 28px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr) 1fr', gap: 0, alignItems: 'center' }}>
          {[
            { val: '10+', sub: 'Document Types' },
            { val: '8+', sub: 'Government Schemes' },
            { val: '3', sub: 'Languages' },
            { val: 'Safer, Smarter,', sub: 'More Informed Citizens' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px 20px', borderRight: '1px solid #EEF2F8', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#173A78', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#8A9AB8', marginTop: 4, fontWeight: 500 }}>{s.sub}</div>
            </div>
          ))}
          {/* Quote */}
          <div style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontStyle: 'italic', color: '#546A8C', lineHeight: 1.5 }}>
              &ldquo;When citizens understand,<br />democracy grows stronger.&rdquo;
            </div>
            <div style={{ fontSize: 11, color: '#B0BDD0', marginTop: 6, fontWeight: 500 }}>— A more inclusive India</div>
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #FDF8F0 0%, #FAFBFF 100%)', padding: '80px 28px' }}>
        <div className="problem-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>THE PROBLEM</p>
            <h2 style={{ fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.02em' }}>
              Important information.<br />
              <span style={{ color: '#1557B0' }}>Unnecessarily difficult.</span>
            </h2>
            <p style={{ fontSize: 15, color: '#546A8C', lineHeight: 1.7, marginBottom: 36 }}>
              Government documents often use complex language, leaving many citizens confused about what they mean and what to do next.
            </p>
            {/* Problem cards with glassmorphism */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { icon: '📋', title: 'Complex Language', desc: 'Official language is often hard to understand.' },
                { icon: '❓', title: 'Unclear Actions', desc: 'Not sure what needs to be done.' },
                { icon: '🌐', title: 'Language Barriers', desc: 'Difficult for non-English speakers.' },
                { icon: '⏰', title: 'Missed Deadlines', desc: 'Important dates are easily overlooked.' },
              ].map(p => (
                <div key={p.title} className="feature-glass" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0D1B3E', marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: '#7A90B4', lineHeight: 1.5 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen illustration */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
            <div style={{ position: 'relative', maxWidth: 380 }}>
              <Image src="/assets/10_citizen_illustration.png" alt="Citizen reading a document" width={380} height={480} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
              {/* Annotation overlay */}
              <div style={{ position: 'absolute', top: 40, right: -20, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(23,58,120,0.1)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 16px rgba(23,58,120,0.1)' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#173A78', fontStyle: 'italic', lineHeight: 1.5 }}>
                  This should<br />be simpler...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '80px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start', marginBottom: 56 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>HOW SAHAYAK WORKS</p>
              <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: '#0D1B3E', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                From a complicated document<br />
                to clear next steps —{' '}
                <span style={{ color: '#1557B0', fontStyle: 'italic' }}>in just a few seconds.</span>
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p style={{ fontSize: 15, color: '#546A8C', lineHeight: 1.7 }}>
                A simple, 4-step process to go from confusion to clarity.
              </p>
            </div>
          </div>

          <div className="step-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, position: 'relative' }}>
            {[
              { n: '01', icon: '📤', title: 'Upload', body: 'Upload a photo or PDF of your government document.' },
              { n: '02', icon: '🔍', title: 'Understand', body: 'Sahayak reads and analyzes the document using AI and OCR.' },
              { n: '03', icon: '💡', title: 'Get Clarity', body: 'Receive a simple explanation in your preferred language.' },
              { n: '04', icon: '✅', title: 'Take Action', body: 'Find relevant schemes, nearby services and next steps.' },
            ].map((s, i) => (
              <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="step-card" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#1557B0', letterSpacing: '0.05em' }}>{s.n}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0D1B3E', marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: '#7A90B4', lineHeight: 1.6 }}>{s.body}</div>
                </div>
                {i < 3 && (
                  <div style={{ paddingTop: 28, color: '#CBD5E8', flexShrink: 0 }}>
                    <svg width="20" height="16" viewBox="0 0 20 16" fill="none"><path d="M1 8h15M12 4l5 4-5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Landmark background strip */}
          <div style={{ marginTop: 48, borderRadius: 20, overflow: 'hidden', position: 'relative', height: 140, background: 'linear-gradient(180deg, #E8F0FB 0%, #C5D5F0 100%)' }}>
            <Image src="/assets/14_landmark_line_art.png" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.45 }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 48px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#173A78', fontStyle: 'italic', lineHeight: 1.5 }}>Empowered Citizens<br /><strong>Stronger India</strong></div>
                <Image src="/assets/05_indian_tricolor_accent.png" alt="" width={40} height={28} style={{ marginTop: 8, objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features (glassmorphism) ──────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #EBF2FF 0%, #F0F5FF 50%, #EEF3FB 100%)', padding: '80px 28px', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
          <Image src="/assets/13_subtle_pattern.png" alt="" fill style={{ objectFit: 'cover' }} />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1557B0', marginBottom: 12 }}>CAPABILITIES</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: '#0D1B3E', margin: '0 auto 48px', maxWidth: 560, lineHeight: 1.25 }}>
            Everything you need to understand any government document
          </h2>

          <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[
              { icon: '📄', title: 'Document Analysis', body: 'Instant structured explanation: what it is, who issued it, and what it means for you.', color: '#EBF4FF', ink: '#1557B0' },
              { icon: '🌐', title: 'Three Languages', body: 'Switch between English, Hindi, and Telugu at any time without re-uploading.', color: '#E8F7F0', ink: '#2E8B67' },
              { icon: '💬', title: 'AI Assistant', body: 'Ask follow-up questions in plain language. Answers are grounded in your document.', color: '#F1ECFB', ink: '#6B4EE6' },
              { icon: '🏛️', title: 'Scheme Matching', body: 'See which government welfare schemes you may be eligible for based on your documents.', color: '#EBF4FF', ink: '#1557B0' },
              { icon: '📍', title: 'Mee Seva Finder', body: 'View nearby Mee Seva centres when in-person assistance is needed.', color: '#E8F7F0', ink: '#2E8B67' },
              { icon: '⏰', title: 'Deadline Tracking', body: 'Key dates and required actions are extracted and highlighted clearly.', color: '#FFF8EC', ink: '#D9972B' },
            ].map(f => (
              <div key={f.title} className="feature-glass">
                <div style={{ width: 46, height: 46, borderRadius: 12, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0D1B3E', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#7A90B4', lineHeight: 1.6 }}>{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#173A78', padding: '80px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, opacity: 0.07 }}>
          <Image src="/assets/14_landmark_line_art.png" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center bottom' }} />
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33%, #fff 66.66%, #138808 66.66%)' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.025em' }}>
            Try Sahayak — free.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 36, lineHeight: 1.7 }}>
            Upload any government document and Sahayak will explain it in plain language — in under a minute.
          </p>
          <Link href="/app/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'white', color: '#173A78', borderRadius: 10, padding: '15px 30px', fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
            Upload a document
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9h10M10 5l4 4-4 4" stroke="#173A78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>No account required · Works with photos, scans, and PDFs</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ background: '#0D1B3E', padding: '52px 28px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 48, justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 44 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Image src="/v2-assets/logo-mark-white.svg" alt="Sahayak" width={30} height={30} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: 'white' }}>Sahayak</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Documents to Direction</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', maxWidth: 240, lineHeight: 1.6 }}>
                Government documents, explained in plain language. Free for citizens.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 52, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>Product</p>
                {['How it works', 'Features', 'Impact', 'About'].map(l => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <Link href={`/${l.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{l}</Link>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>App</p>
                {[['Dashboard', '/app/dashboard'], ['Documents', '/app/documents'], ['AI Chat', '/app/chat'], ['Schemes', '/app/schemes']].map(([l, h]) => (
                  <div key={l} style={{ marginBottom: 10 }}>
                    <Link href={h} style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{l}</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 22 }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
            &copy; 2026 Sahayak. Built for Indian citizens.
          </p>
        </div>
      </footer>
    </div>
  );
}
