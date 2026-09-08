import { APP_URL } from '@/lib/config';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impact',
};

const H = { fontFamily: "'Plus Jakarta Sans', system-ui" } as const;

const PROBLEMS = [
  {
    icon: '📜',
    heading: 'The document language barrier',
    body: 'Indian government documents are written in formal, legal language that most citizens find difficult to parse — even educated ones. This isn\'t a literacy problem. Government communication is designed for bureaucratic clarity, not citizen understanding.',
  },
  {
    icon: '⌛',
    heading: 'Missed deadlines with real consequences',
    body: 'Submission windows, validity periods, and renewal dates are buried inside documents. Many citizens unknowingly miss critical deadlines — causing missed benefits, expired entitlements, or unnecessary penalties.',
  },
  {
    icon: '🧭',
    heading: 'Unclear what to do next',
    body: 'Even when citizens read their documents, they often don\'t know what action to take, where to go, or what other documents they need. This ambiguity causes delays, repeated trips to offices, and abandoned entitlements.',
  },
  {
    icon: '🌍',
    heading: 'Language exclusion',
    body: 'Official documents are often issued in English, even when the recipient primarily speaks Hindi or Telugu. Without a translation, the document is functionally inaccessible — even if legally delivered.',
  },
];

const WHO = [
  { label: 'Senior citizens', icon: '👴', note: 'Receiving pension and benefit notices' },
  { label: 'First-generation graduates', icon: '🎓', note: 'Applying for scholarships and certificates' },
  { label: 'Farmers', icon: '🌾', note: 'Navigating land records and crop insurance' },
  { label: 'Rural households', icon: '🏡', note: 'Accessing welfare schemes and rations' },
  { label: 'Small business owners', icon: '🏪', note: 'Handling tax and licence notices' },
  { label: 'Migrant workers', icon: '🧳', note: 'Understanding documents in unfamiliar states' },
];

export default function ImpactPage() {
  return (
    <>
      {/* Header */}
      <section
        className="relative pt-28 pb-16 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #07111F 0%, #0F2A65 50%, #0A1E3C 100%)' }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33%, #fff 66.66%, #138808 66.66%)' }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#F4A340] mb-4">Mission</p>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl" style={H}>
            Why Sahayak exists
          </h1>
          <p className="mt-5 text-base text-white/55 max-w-xl mx-auto leading-relaxed">
            Every citizen deserves to understand the documents their government sends them.
            That's the only problem Sahayak is trying to solve.
          </p>
        </div>
      </section>

      {/* Mission statement */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#173A78] mb-5">The problem</p>
          <h2 className="text-3xl font-extrabold text-[#101828] mb-8" style={H}>
            Government documents are powerful. Most people can't read them.
          </h2>
          <p className="text-base text-[#667085] leading-relaxed mb-5">
            Every year, millions of Indian citizens receive official government documents — income
            certificates, land records, pension orders, scheme benefit letters, tax notices — that they
            can't fully understand. The language is formal. The consequences are real. And the help they
            need is often unavailable, unaffordable, or simply not there.
          </p>
          <p className="text-base text-[#667085] leading-relaxed">
            The result: missed deadlines, unclaimed benefits, unnecessary visits to government offices,
            and a creeping feeling that the system wasn't built for them. Sahayak was built to fix that
            specific gap — not to replace government services, but to make them accessible.
          </p>
        </div>
      </section>

      {/* Problem cards */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {PROBLEMS.map((p) => (
              <div key={p.heading} className="rounded-2xl border border-[#E5E7EB] bg-white p-7">
                <span className="text-3xl block mb-4">{p.icon}</span>
                <h3 className="text-lg font-bold text-[#101828] mb-2" style={H}>
                  {p.heading}
                </h3>
                <p className="text-sm text-[#667085] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#173A78] mb-3">Who it's for</p>
            <h2 className="text-3xl font-extrabold text-[#101828] sm:text-4xl" style={H}>
              Built for citizens who navigate the system alone.
            </h2>
            <p className="mt-4 text-base text-[#667085] max-w-xl leading-relaxed">
              Sahayak is most useful for people who don't have access to a lawyer, an accountant,
              or a knowledgeable family member to explain government documents.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {WHO.map((w) => (
              <div key={w.label} className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 text-center">
                <span className="text-3xl block mb-3">{w.icon}</span>
                <p className="text-sm font-bold text-[#101828] mb-1" style={H}>
                  {w.label}
                </p>
                <p className="text-[11px] text-[#9BA7B5] leading-snug">{w.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Sahayak doesn't claim */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, #0A1E3C 0%, #0F2A65 100%)' }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-white mb-8" style={H}>
            What Sahayak is — and isn't.
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: 'Plain-language document explanations', yes: true },
              { label: 'Multilingual output (EN / HI / TE)', yes: true },
              { label: 'Action plans with deadlines', yes: true },
              { label: 'Government scheme matching', yes: true },
              { label: 'An official government portal', yes: false },
              { label: 'A legal advisor or lawyer', yes: false },
              { label: 'Affiliated with any government body', yes: false },
              { label: 'A replacement for the issuing authority', yes: false },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: item.yes ? 'rgba(47,166,106,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${item.yes ? 'rgba(47,166,106,0.25)' : 'rgba(255,255,255,0.06)'}` }}
              >
                <span className={`text-base ${item.yes ? 'text-[#2FA66A]' : 'text-white/30'}`}>
                  {item.yes ? '✓' : '✗'}
                </span>
                <span className={`text-sm ${item.yes ? 'text-white/80' : 'text-white/40'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-white/30 leading-relaxed">
            Sahayak is an independent tool. It is not affiliated with or endorsed by any government
            department. For critical decisions, always verify information with the issuing authority.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-[#101828] mb-4" style={H}>
            Try it for any government document.
          </h2>
          <p className="text-base text-[#667085] mb-8 max-w-md mx-auto">
            Upload a certificate, notice, or letter — and see what Sahayak explains in under a minute.
          </p>
          <a
            href={APP_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#102D63] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#173A78] transition-colors shadow-[0_4px_16px_rgba(16,45,99,0.25)]"
          >
            Try Sahayak free
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
