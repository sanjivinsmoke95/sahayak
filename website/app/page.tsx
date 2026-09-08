import type { Metadata } from 'next';
import { APP_URL } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Sahayak — Government Documents Made Clear',
};

const H = { fontFamily: "'Plus Jakarta Sans', system-ui" } as const;

function GovDocumentCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`bg-[#FEF9F3] rounded-2xl border border-[#E2D5C3] shadow-[0_4px_24px_rgba(0,0,0,0.10)] ${compact ? 'p-4' : 'p-5'}`}>
      <div className="text-center border-b border-[#DDD0BC] pb-3 mb-3">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="text-base">🏛</span>
          <p className={`font-bold uppercase tracking-widest text-[#4A5D75] ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
            Government of Telangana
          </p>
        </div>
        <p className={`text-[#9BA7B5] uppercase tracking-wider ${compact ? 'text-[8px]' : 'text-[9px]'}`}>
          Revenue Department · Hyderabad District
        </p>
      </div>
      <p className={`text-center font-bold text-[#101828] mb-3 tracking-wider uppercase ${compact ? 'text-[10px]' : 'text-xs'}`} style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
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
            This is to certify that <strong className="text-[#101828]">Shri Ramesh Kumar</strong>, residing at Sector-12, Hyderabad, has an annual family income of <strong className="text-[#101828]">₹1,20,000/-</strong> for the financial year 2023–24.
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

function SahayakAnalysisCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#EAF1FF] shadow-[0_4px_24px_rgba(16,45,120,0.10)] overflow-hidden">
      <div className="bg-[#FEF9F3] border-b border-[#EAF1FF] px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-bold text-[#101828] text-xs">Income Certificate</p>
          <p className="text-[9px] text-[#667085] mt-0.5">Revenue Dept · Telangana · Jan 2024</p>
        </div>
        <span className="text-[9px] font-bold bg-[#EAF7F0] text-[#2FA66A] px-2.5 py-1 rounded-full">✓ Explained</span>
      </div>
      <div className="space-y-2 p-3">
        <div className="rounded-xl bg-[#EAF1FF] p-3">
          <p className="text-[10px] font-bold text-[#173A78] mb-1">📄 What is this?</p>
          <p className="text-[9.5px] text-[#101828] leading-relaxed">This proves your family earns ₹1,20,000 per year. It's an official government document.</p>
        </div>
        <div className="rounded-xl bg-[#EAF7F0] p-3">
          <p className="text-[10px] font-bold text-[#2FA66A] mb-1">✅ What should I do?</p>
          <p className="text-[9.5px] text-[#101828]">Keep it safely. Use it to apply for BPL card, scholarships, or welfare schemes.</p>
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

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section
        className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pb-28"
        style={{ background: 'radial-gradient(ellipse 140% 90% at 55% -15%, #1E4899 0%, #0F2A65 40%, #07111F 100%)' }}
      >
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33%, #fff 66.66%, #138808 66.66%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F4A340]" />
                <span className="text-xs font-medium text-white/60">Citizen Document Assistant</span>
              </div>

              <h1 className="text-4xl font-extrabold text-white leading-[1.12] tracking-tight sm:text-5xl" style={H}>
                Government documents,{' '}
                <span style={{ color: '#F4A340' }}>finally clear.</span>
              </h1>

              <p className="mt-5 text-base text-white/60 leading-relaxed sm:text-lg max-w-[480px]">
                Sahayak reads any government document and tells you what it means, why you received it, and exactly what to do next — in plain English, Hindi, or Telugu.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#102D63] hover:bg-[#EFF5FF] transition-colors shadow-[0_4px_16px_rgba(255,255,255,0.15)]"
                >
                  Try Sahayak free
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a href="/how-it-works" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/35 hover:bg-white/8 hover:text-white transition-colors">
                  See how it works
                </a>
              </div>

              <div className="mt-7 flex items-center gap-2.5 flex-wrap">
                <span className="text-xs text-white/35">Available in</span>
                {['English', 'हिंदी', 'తెలుగు'].map((l) => (
                  <span key={l} className="text-xs font-medium border border-white/12 bg-white/6 text-white/55 px-3 py-1 rounded-full">{l}</span>
                ))}
              </div>

              <div className="mt-8 pt-7 border-t border-white/8">
                <p className="text-xs text-white/30 mb-3">What Sahayak can help with</p>
                <div className="flex flex-wrap gap-2">
                  {['Income certificates','Caste certificates','Land records','Pension notices','Tax notices','Scheme letters'].map((tag) => (
                    <span key={tag} className="text-[11px] text-white/45 border border-white/8 bg-white/4 px-2.5 py-1 rounded-md">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Mockup */}
            <div className="hidden lg:block">
              <div className="relative max-w-[420px] mx-auto space-y-3">
                <div className="absolute -inset-6 rounded-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(100,140,220,0.18) 0%, transparent 70%)' }} />
                <div className="relative space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" /><span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Original document</span><div className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className="opacity-80"><GovDocumentCard /></div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#F4A340]/50" />
                    <div className="flex items-center gap-1.5 rounded-full border border-[#F4A340]/30 bg-[#F4A340]/10 px-3 py-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#F4A340]" />
                      <span className="text-[9px] font-bold tracking-[0.15em] text-[#F4A340]">SAHAYAK</span>
                    </div>
                    <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#F4A340]/50" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" /><span className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.15em]">Sahayak explains</span><div className="h-px flex-1 bg-white/10" />
                  </div>
                  <SahayakAnalysisCard />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile mockup */}
          <div className="mt-12 lg:hidden max-w-sm mx-auto">
            <SahayakAnalysisCard />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, #F8FAFC)' }} />
      </section>

      {/* PROBLEM */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#F4A340] mb-3">The Problem</p>
            <h2 className="text-3xl font-extrabold text-[#101828] leading-tight sm:text-4xl" style={H}>Receiving a government document shouldn't feel like this.</h2>
            <p className="mt-4 text-base text-[#667085] leading-relaxed">Every year, millions of citizens receive important government documents they can't fully understand. That's not a literacy problem — it's a communication problem.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: '📜', title: 'Written in legal language', body: 'Government documents use formal, technical language that most people find difficult to follow — even educated citizens.' },
              { icon: '❓', title: 'Unclear what action to take', body: 'Documents rarely explain clearly what the recipient should do, when to do it, or where to go. Confusion is the default.' },
              { icon: '📅', title: 'Important deadlines are buried', body: 'Expiry dates, submission windows, and renewal deadlines are hidden in dense paragraphs. Missing them has real consequences.' },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-6">
                <span className="text-3xl mb-4 block">{p.icon}</span>
                <h3 className="text-base font-bold text-[#101828] mb-2" style={H}>{p.title}</h3>
                <p className="text-sm text-[#667085] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#F8FAFC] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#173A78] mb-3">How it works</p>
            <h2 className="text-3xl font-extrabold text-[#101828] leading-tight sm:text-4xl" style={H}>From document to direction, in minutes.</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '01', title: 'Upload your document', body: 'Take a photo, scan, or pick a PDF. Sahayak accepts any government document.', color: '#EAF1FF', ink: '#173A78' },
              { n: '02', title: 'Sahayak reads it', body: 'Our AI reads the document, extracts the key information, and understands what type of document it is.', color: '#EAF7F0', ink: '#2FA66A' },
              { n: '03', title: 'You get a clear explanation', body: 'Every document gets a plain-language summary: what it is, why you received it, and what matters inside.', color: '#FFF4E7', ink: '#C77A1B' },
              { n: '04', title: 'Know exactly what to do next', body: 'Sahayak tells you what action is required, by when, and where to go.', color: '#F1ECFB', ink: '#6B4EE6' },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl p-6 border border-transparent" style={{ backgroundColor: s.color + '55', borderColor: s.color }}>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold mb-4" style={{ backgroundColor: s.ink, color: '#fff' }}>{s.n}</div>
                <h3 className="text-base font-bold text-[#101828] mb-2" style={H}>{s.title}</h3>
                <p className="text-sm text-[#667085] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href="/how-it-works" className="inline-flex items-center gap-2 text-sm font-semibold text-[#173A78] hover:text-[#102D63] transition-colors">
              Learn more about how Sahayak works
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* MULTILINGUAL */}
      <section className="py-20 sm:py-24" style={{ background: 'linear-gradient(135deg, #0A1E3C 0%, #0F2A65 60%, #0A1E3C 100%)' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#F4A340] mb-3">Multilingual</p>
            <h2 className="text-3xl font-extrabold text-white leading-tight sm:text-4xl" style={H}>Your language. Your documents.</h2>
            <p className="mt-4 text-base text-white/55 max-w-xl mx-auto leading-relaxed">Sahayak explains every document in English, Hindi, and Telugu.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { lang: 'English', q: 'What should I do?', a: 'Submit this income certificate along with your Aadhaar card at the nearest Mee Seva centre within 30 days.', active: true },
              { lang: 'हिंदी', q: 'मुझे क्या करना चाहिए?', a: 'यह आय प्रमाण पत्र और अपना आधार कार्ड 30 दिनों के भीतर निकटतम मी सेवा केंद्र में जमा करें।', active: false },
              { lang: 'తెలుగు', q: 'నేను ఏమి చేయాలి?', a: 'ఈ ఆదాయ ధృవపత్రాన్ని మరియు మీ ఆధార్ కార్డును 30 రోజుల లోపల సమీప మీ‌సేవ కేంద్రంలో సమర్పించండి.', active: false },
            ].map((d) => (
              <div key={d.lang} className="rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{d.lang}</span>
                  {d.active && <span className="text-[9px] font-bold text-[#2FA66A] bg-[#2FA66A]/15 border border-[#2FA66A]/25 px-2 py-0.5 rounded-full">Active</span>}
                </div>
                <p className="text-base font-bold text-white mb-3 leading-snug">{d.q}</p>
                <p className="text-sm text-white/60 leading-relaxed">{d.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl px-8 py-14 text-center sm:px-16" style={{ background: 'linear-gradient(135deg, #0F2A65 0%, #173A78 50%, #102D63 100%)' }}>
            <div className="flex justify-center gap-2 mb-6">
              <span className="h-1 w-6 rounded-full bg-[#FF9933]" />
              <span className="h-1 w-6 rounded-full bg-white/60" />
              <span className="h-1 w-6 rounded-full bg-[#138808]" />
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-4" style={H}>Ready to understand your documents?</h2>
            <p className="text-base text-white/60 max-w-md mx-auto mb-8 leading-relaxed">Upload any government document and Sahayak will explain it clearly — free, private, and in your language.</p>
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#102D63] hover:bg-[#EFF5FF] transition-colors shadow-lg"
            >
              Try Sahayak free
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <p className="mt-5 text-xs text-white/30">No sign-up required to try · Works on mobile and desktop</p>
          </div>
        </div>
      </section>
    </>
  );
}
