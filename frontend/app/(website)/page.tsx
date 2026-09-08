import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sahayak — Government Documents Made Clear',
};

/* ─── Shared heading style ─── */
const HEADING = { fontFamily: 'var(--font-display), system-ui' } as const;

/* ════════════════════════════════════════════════
   PRODUCT MOCKUP COMPONENTS
   Realistic recreation of the Sahayak UI used in
   the hero and feature sections.
════════════════════════════════════════════════ */

function GovDocumentCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`bg-[#FEF9F3] rounded-2xl border border-[#E2D5C3] shadow-[0_4px_24px_rgba(0,0,0,0.10)] ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      {/* Document header */}
      <div className="text-center border-b border-[#DDD0BC] pb-3 mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="text-base">🏛</span>
          <p
            className={`font-bold uppercase tracking-widest text-[#4A5D75] ${compact ? 'text-[9px]' : 'text-[10px]'}`}
          >
            Government of Telangana
          </p>
        </div>
        <p className={`text-[#9BA7B5] uppercase tracking-wider ${compact ? 'text-[8px]' : 'text-[9px]'}`}>
          Revenue Department · Hyderabad District
        </p>
      </div>

      <p
        className={`text-center font-bold text-[#101828] mb-3 tracking-wider uppercase ${compact ? 'text-[10px]' : 'text-xs'}`}
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        Income Certificate
      </p>

      <div className={`space-y-1.5 text-[#4A5D75] ${compact ? 'text-[9px]' : 'text-[10.5px]'}`}>
        <div className="flex gap-2">
          <span className="w-14 shrink-0 text-[#9BA7B5]">Ref No:</span>
          <span className="font-mono text-[#101828] text-[9px]">TS/RC/2024/HD/08234</span>
        </div>
        <div className="flex gap-2">
          <span className="w-14 shrink-0 text-[#9BA7B5]">Date:</span>
          <span className="text-[#101828]">15 January 2024</span>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-[#E2D5C3]">
          <p className={`leading-relaxed text-[#667085] ${compact ? 'text-[8.5px]' : 'text-[9.5px]'}`}>
            This is to certify that{' '}
            <strong className="text-[#101828]">Shri Ramesh Kumar</strong>, residing at Sector-12, Hyderabad,
            has an annual family income of{' '}
            <strong className="text-[#101828]">₹1,20,000/-</strong> for the financial year 2023–24. This
            certificate is issued for the purpose of availing government benefits.
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E2D5C3] flex justify-between items-end">
        <div>
          <p className="text-[8px] text-[#9BA7B5]">Signed</p>
          <p className="text-[10px] font-semibold text-[#101828]">Mandal Revenue Officer</p>
        </div>
        <div className="h-10 w-14 border border-dashed border-[#C8BDB0] rounded-lg flex items-center justify-center">
          <span className="text-[7px] text-[#C8BDB0] uppercase tracking-wider">Seal</span>
        </div>
      </div>
    </div>
  );
}

function SahayakAnalysisCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EAF1FF] shadow-[0_4px_24px_rgba(16,45,120,0.10)] overflow-hidden">
      {/* App header bar */}
      <div className="bg-[#FEF9F3] border-b border-[#EAF1FF] px-4 py-3 flex items-center justify-between">
        <div>
          <p className={`font-bold text-[#101828] ${compact ? 'text-[10px]' : 'text-xs'}`}>Income Certificate</p>
          <p className="text-[9px] text-[#667085] mt-0.5">Revenue Dept · Telangana · Jan 2024</p>
        </div>
        <span className="text-[9px] font-bold bg-[#EAF7F0] text-[#2FA66A] px-2.5 py-1 rounded-full">✓ Explained</span>
      </div>

      {/* QA cards */}
      <div className={`space-y-2 ${compact ? 'p-2.5' : 'p-3'}`}>
        <div className="rounded-xl bg-[#EAF1FF] p-3">
          <p className="text-[10px] font-bold text-[#173A78] mb-1">📄 What is this?</p>
          <p className="text-[9.5px] text-[#101828] leading-relaxed">
            This proves your family earns ₹1,20,000 per year. It's an official government document.
          </p>
        </div>

        <div className="rounded-xl bg-[#EAF7F0] p-3">
          <p className="text-[10px] font-bold text-[#2FA66A] mb-1">✅ What should I do?</p>
          <p className="text-[9.5px] text-[#101828]">1. Keep it safely. Use it to apply for BPL card, scholarships, or welfare schemes.</p>
        </div>

        <div className="rounded-xl bg-[#FFF4E7] p-3 flex items-center gap-2.5">
          <span className="text-base">⏰</span>
          <div>
            <p className="text-[10px] font-bold text-[#C77A1B]">Valid for 3 months</p>
            <p className="text-[9px] text-[#667085]">Submit before April 15, 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductMockup() {
  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      {/* Ambient glow behind the mockup */}
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(100,140,220,0.18) 0%, transparent 70%)' }}
      />

      <div className="relative space-y-3">
        {/* Before label */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Original document</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Government document (slightly muted) */}
        <div className="opacity-80">
          <GovDocumentCard />
        </div>

        {/* Connecting badge */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#F4A340]/50" />
          <div className="flex items-center gap-1.5 rounded-full border border-[#F4A340]/30 bg-[#F4A340]/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F4A340]" />
            <span className="text-[9px] font-bold tracking-[0.15em] text-[#F4A340]">SAHAYAK</span>
          </div>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#F4A340]/50" />
        </div>

        {/* After label */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Sahayak explains</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Analysis card (prominent) */}
        <SahayakAnalysisCard />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   SECTION 1 — HERO
════════════════════════════════════════════════ */

function Hero() {
  return (
    <section
      className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pb-28"
      style={{
        background:
          'radial-gradient(ellipse 140% 90% at 55% -15%, #1E4899 0%, #0F2A65 40%, #07111F 100%)',
      }}
    >
      {/* Indian identity — tricolor hairline at very top */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] pointer-events-none"
        style={{ background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33%, #fff 66.66%, #138808 66.66%)' }}
      />

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left — text */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F4A340]" />
              <span className="text-xs font-medium text-white/60">Citizen Document Assistant</span>
            </div>

            <h1
              className="text-4xl font-extrabold text-white leading-[1.12] tracking-tight sm:text-5xl"
              style={HEADING}
            >
              Government documents,{' '}
              <span
                className="relative"
                style={{ color: '#F4A340' }}
              >
                finally clear.
              </span>
            </h1>

            <p className="mt-5 text-base text-white/60 leading-relaxed sm:text-lg max-w-[480px]">
              Sahayak reads any government document and tells you what it means, why you received it,
              and exactly what to do next — in plain English, Hindi, or Telugu.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#102D63] hover:bg-[#EFF5FF] transition-colors shadow-[0_4px_16px_rgba(255,255,255,0.15)] active:scale-95"
              >
                Try Sahayak free
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/35 hover:bg-white/8 hover:text-white transition-colors"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-7 flex items-center gap-2.5 flex-wrap">
              <span className="text-xs text-white/35">Available in</span>
              {['English', 'हिंदी', 'తెలుగు'].map((l) => (
                <span
                  key={l}
                  className="text-xs font-medium border border-white/12 bg-white/6 text-white/55 px-3 py-1 rounded-full"
                >
                  {l}
                </span>
              ))}
            </div>

            <div className="mt-8 pt-7 border-t border-white/8">
              <p className="text-xs text-white/30 mb-3">What Sahayak can help with</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Income certificates',
                  'Caste certificates',
                  'Land records',
                  'Pension notices',
                  'Tax notices',
                  'Scheme letters',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-white/45 border border-white/8 bg-white/4 px-2.5 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — product mockup */}
          <div className="hidden lg:block">
            <ProductMockup />
          </div>
        </div>

        {/* Mobile product mockup — smaller, shown below text */}
        <div className="mt-12 lg:hidden">
          <div className="relative max-w-sm mx-auto">
            <div
              className="absolute -inset-4 rounded-3xl pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(100,140,220,0.15) 0%, transparent 70%)' }}
            />
            <div className="relative">
              <SahayakAnalysisCard />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade into page */}
      <div
        className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #F8FAFC)' }}
      />
    </section>
  );
}

/* ════════════════════════════════════════════════
   SECTION 2 — PROBLEM
════════════════════════════════════════════════ */

function ProblemSection() {
  const PROBLEMS = [
    {
      icon: '📜',
      title: 'Written in legal language',
      body: 'Government documents use formal, technical language that most people find difficult to follow — even educated citizens.',
    },
    {
      icon: '❓',
      title: 'Unclear what action to take',
      body: 'Documents rarely explain clearly what the recipient should do, when to do it, or where to go. Confusion is the default.',
    },
    {
      icon: '📅',
      title: 'Important deadlines are buried',
      body: 'Expiry dates, submission windows, and renewal deadlines are hidden in dense paragraphs. Missing them has real consequences.',
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#F4A340] mb-3">The Problem</p>
          <h2 className="text-3xl font-extrabold text-[#101828] leading-tight sm:text-4xl" style={HEADING}>
            Receiving a government document shouldn't feel like this.
          </h2>
          <p className="mt-4 text-base text-[#667085] leading-relaxed">
            Every year, millions of citizens receive important government documents they can't fully understand.
            That's not a literacy problem — it's a communication problem.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6 hover:border-[#D6DDE8] hover:shadow-[0_2px_12px_rgba(16,45,99,0.06)] transition-all"
            >
              <span className="text-3xl mb-4 block">{p.icon}</span>
              <h3 className="text-base font-bold text-[#101828] mb-2" style={HEADING}>
                {p.title}
              </h3>
              <p className="text-sm text-[#667085] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   SECTION 3 — HOW IT WORKS
════════════════════════════════════════════════ */

function HowItWorks() {
  const STEPS = [
    {
      n: '01',
      title: 'Upload your document',
      body: 'Take a photo, scan, or pick a PDF. Sahayak accepts any government document — certificate, notice, letter, or order.',
      color: '#EAF1FF',
      ink: '#173A78',
    },
    {
      n: '02',
      title: 'Sahayak reads it',
      body: 'Our AI reads the document, extracts the key information, and understands what type of document it is.',
      color: '#EAF7F0',
      ink: '#2FA66A',
    },
    {
      n: '03',
      title: 'You get a clear explanation',
      body: 'Every document gets a plain-language summary: what it is, why you received it, and what matters inside it.',
      color: '#FFF4E7',
      ink: '#C77A1B',
    },
    {
      n: '04',
      title: 'Know exactly what to do next',
      body: 'Sahayak tells you what action is required, by when, where to go, and highlights any relevant government schemes.',
      color: '#F1ECFB',
      ink: '#6B4EE6',
    },
  ];

  return (
    <section className="bg-[#F8FAFC] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#173A78] mb-3">How it works</p>
          <h2 className="text-3xl font-extrabold text-[#101828] leading-tight sm:text-4xl" style={HEADING}>
            From document to direction, in minutes.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px border-t-2 border-dashed border-[#D6DDE8] z-0" style={{ width: 'calc(100% - 64px)', left: '100%', transform: 'translateX(-50%)' }} />
              )}

              <div
                className="relative rounded-2xl p-6 border border-transparent transition-all hover:shadow-[0_4px_20px_rgba(16,45,99,0.08)]"
                style={{ backgroundColor: s.color + '55', borderColor: s.color }}
              >
                <div
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold mb-4"
                  style={{ backgroundColor: s.ink, color: '#fff' }}
                >
                  {s.n}
                </div>
                <h3 className="text-base font-bold text-[#101828] mb-2" style={HEADING}>
                  {s.title}
                </h3>
                <p className="text-sm text-[#667085] leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#173A78] hover:text-[#102D63] transition-colors"
          >
            Learn more about how Sahayak works
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   SECTION 4 — MULTILINGUAL
════════════════════════════════════════════════ */

function MultilingualSection() {
  const DEMOS = [
    {
      lang: 'English',
      question: 'What should I do?',
      answer:
        'Submit this income certificate along with your Aadhaar card at the nearest Mee Seva centre within 30 days.',
    },
    {
      lang: 'हिंदी',
      question: 'मुझे क्या करना चाहिए?',
      answer:
        'यह आय प्रमाण पत्र और अपना आधार कार्ड 30 दिनों के भीतर निकटतम मी सेवा केंद्र में जमा करें।',
    },
    {
      lang: 'తెలుగు',
      question: 'నేను ఏమి చేయాలి?',
      answer:
        'ఈ ఆదాయ ధృవపత్రాన్ని మరియు మీ ఆధార్ కార్డును 30 రోజుల లోపల సమీప మీ‌సేవ కేంద్రంలో సమర్పించండి.',
    },
  ];

  return (
    <section
      className="py-20 sm:py-24"
      style={{
        background: 'linear-gradient(135deg, #0A1E3C 0%, #0F2A65 60%, #0A1E3C 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#F4A340] mb-3">Multilingual</p>
          <h2 className="text-3xl font-extrabold text-white leading-tight sm:text-4xl" style={HEADING}>
            Your language. Your documents.
          </h2>
          <p className="mt-4 text-base text-white/55 max-w-xl mx-auto leading-relaxed">
            Sahayak explains every document in English, Hindi, and Telugu — so citizens can understand
            their rights in the language they're most comfortable with.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {DEMOS.map((d, i) => (
            <div
              key={d.lang}
              className="rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{d.lang}</span>
                {i === 0 && (
                  <span className="text-[9px] font-bold text-[#2FA66A] bg-[#2FA66A]/15 border border-[#2FA66A]/25 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-base font-bold text-white mb-3 leading-snug">{d.question}</p>
              <p className="text-sm text-white/60 leading-relaxed">{d.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-white/30">
            Switch languages instantly — the same explanation, in your preferred language.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   SECTION 5 — FEATURES
════════════════════════════════════════════════ */

function FeaturesSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#173A78] mb-3">Capabilities</p>
          <h2 className="text-3xl font-extrabold text-[#101828] sm:text-4xl" style={HEADING}>
            Everything a citizen needs.
          </h2>
          <p className="mt-4 text-base text-[#667085] max-w-xl mx-auto">
            Sahayak is built around real document problems that citizens face every day.
          </p>
        </div>

        {/* Feature 1 — Document explanation (big) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center mb-16">
          <div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1FF] mb-5">
              <span className="text-xl">📄</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#101828] mb-3" style={HEADING}>
              Plain-language document explanation
            </h3>
            <p className="text-base text-[#667085] leading-relaxed mb-5">
              Upload any government document — certificate, notice, order, or letter — and Sahayak
              produces a clear, readable explanation. What it is. Why you received it. What matters.
              All in language that makes sense.
            </p>
            <ul className="space-y-2.5">
              {[
                'Works with photos, PDFs, and scanned documents',
                'Identifies the document type automatically',
                'Highlights deadlines and required actions',
                'Explains formal language in plain terms',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-[#4A5D75]">
                  <svg className="h-4 w-4 shrink-0 text-[#2FA66A]" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E5E7EB]">
            <SahayakAnalysisCard />
          </div>
        </div>

        <div className="border-t border-[#F0F0F0] my-16" />

        {/* Feature 2 — AI Assistant (reversed) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center mb-16">
          <div className="order-2 lg:order-1 bg-[#F8FAFC] rounded-2xl p-6 border border-[#E5E7EB]">
            {/* Chat mockup */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-[#EAF1FF] flex items-center justify-center shrink-0 text-xs">👤</div>
                <div className="bg-white rounded-xl rounded-tl-none p-3 text-xs text-[#101828] border border-[#EAF1FF] shadow-sm max-w-[80%]">
                  When is the last date to submit this certificate?
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-[#102D63] rounded-xl rounded-tr-none p-3 text-xs text-white max-w-[80%]">
                  The income certificate is valid for 3 months from the issue date of 15 Jan 2024.
                  You need to submit it before <strong>April 15, 2024</strong>. That gives you about
                  90 days from today.
                </div>
                <div className="h-7 w-7 rounded-full bg-[#102D63] flex items-center justify-center shrink-0 text-[10px] text-white font-bold">S</div>
              </div>
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full bg-[#EAF1FF] flex items-center justify-center shrink-0 text-xs">👤</div>
                <div className="bg-white rounded-xl rounded-tl-none p-3 text-xs text-[#101828] border border-[#EAF1FF] shadow-sm max-w-[80%]">
                  Where do I submit it?
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="bg-[#102D63] rounded-xl rounded-tr-none p-3 text-xs text-white max-w-[80%]">
                  Submit it at your nearest <strong>Mee Seva centre</strong>. I can show you the
                  closest one to your current location.
                </div>
                <div className="h-7 w-7 rounded-full bg-[#102D63] flex items-center justify-center shrink-0 text-[10px] text-white font-bold">S</div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1ECFB] mb-5">
              <span className="text-xl">💬</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#101828] mb-3" style={HEADING}>
              Ask anything about your document
            </h3>
            <p className="text-base text-[#667085] leading-relaxed mb-5">
              Sahayak's AI assistant understands the document you uploaded. Ask questions in plain
              language — about deadlines, requirements, where to go, what to bring — and get direct,
              grounded answers.
            </p>
            <ul className="space-y-2.5">
              {[
                'Answers are based on your actual document',
                'Cites official government sources',
                'Works in English, Hindi, and Telugu',
                'Remembers context across your questions',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-[#4A5D75]">
                  <svg className="h-4 w-4 shrink-0 text-[#6B4EE6]" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#F0F0F0] my-16" />

        {/* Feature 3 — Schemes + Services (grid of two smaller blocks) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Scheme matching */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-7">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7F0] mb-5">
              <span className="text-xl">🏦</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#101828] mb-2" style={HEADING}>
              Government scheme matching
            </h3>
            <p className="text-sm text-[#667085] leading-relaxed mb-4">
              Sahayak identifies which government schemes and benefits you may be eligible for based on
              your documents — and tells you what else you need to apply.
            </p>
            <Link href="/features" className="text-sm font-semibold text-[#173A78] hover:text-[#102D63] transition-colors">
              Learn more →
            </Link>
          </div>

          {/* Nearby services */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-7">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4E7] mb-5">
              <span className="text-xl">📍</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#101828] mb-2" style={HEADING}>
              Find nearby Mee Seva centres
            </h3>
            <p className="text-sm text-[#667085] leading-relaxed mb-4">
              When a document requires an in-person visit, Sahayak shows the nearest Mee Seva centres
              on a map with directions and distance.
            </p>
            <Link href="/features" className="text-sm font-semibold text-[#173A78] hover:text-[#102D63] transition-colors">
              Learn more →
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/features" className="inline-flex items-center gap-2 text-sm font-semibold text-[#173A78] hover:text-[#102D63] transition-colors">
            See all features
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   SECTION 6 — DOCUMENT → ACTION FLOW
════════════════════════════════════════════════ */

function DocumentJourneySection() {
  const STEPS = [
    { icon: '📂', label: 'You receive a document', sub: 'Certificate, notice, order, letter' },
    { icon: '📤', label: 'Upload to Sahayak', sub: 'Photo, scan, or PDF' },
    { icon: '🔍', label: 'Sahayak analyses it', sub: 'AI + OCR identifies every detail' },
    { icon: '💡', label: 'You get clarity', sub: 'What it is, why, what to do' },
    { icon: '✅', label: 'You take the right action', sub: 'On time, with confidence' },
  ];

  return (
    <section className="bg-[#F0F5FF] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#173A78] mb-3">
            Document to Direction
          </p>
          <h2 className="text-3xl font-extrabold text-[#101828] sm:text-4xl" style={HEADING}>
            The full journey — from confusion to action.
          </h2>
        </div>

        {/* Flow */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex sm:flex-col items-center sm:items-center flex-1 gap-3 sm:gap-0">
              {/* Step card */}
              <div className="flex sm:flex-col items-center gap-3 sm:gap-3 w-full">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-white border border-[#D6DDE8] shadow-[0_2px_8px_rgba(16,45,99,0.07)] flex items-center justify-center text-2xl">
                  {s.icon}
                </div>
                <div className="sm:text-center">
                  <p className="text-sm font-bold text-[#101828]">{s.label}</p>
                  <p className="text-xs text-[#667085] mt-0.5">{s.sub}</p>
                </div>
              </div>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <>
                  <div className="hidden sm:block flex-1 h-px border-t-2 border-dashed border-[#C4D2EC] mx-2" />
                  <div className="block sm:hidden w-0.5 h-6 border-l-2 border-dashed border-[#C4D2EC] ml-7" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   SECTION 7 — CTA
════════════════════════════════════════════════ */

function CTASection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl px-8 py-14 text-center sm:px-16"
          style={{
            background: 'linear-gradient(135deg, #0F2A65 0%, #173A78 50%, #102D63 100%)',
          }}
        >
          {/* Tricolor accent */}
          <div className="flex justify-center gap-2 mb-6">
            <span className="h-1 w-6 rounded-full bg-[#FF9933]" />
            <span className="h-1 w-6 rounded-full bg-white/60" />
            <span className="h-1 w-6 rounded-full bg-[#138808]" />
          </div>

          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4" style={HEADING}>
            Ready to understand your documents?
          </h2>
          <p className="text-base text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
            Upload any government document and Sahayak will explain it clearly — free, private, and in
            your language.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#102D63] hover:bg-[#EFF5FF] transition-colors shadow-lg active:scale-95"
            >
              Try Sahayak free
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-7 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/12 hover:text-white transition-colors"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-5 text-xs text-white/30">
            No sign-up required to try · Works on mobile and desktop
          </p>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <MultilingualSection />
      <FeaturesSection />
      <DocumentJourneySection />
      <CTASection />
    </>
  );
}
