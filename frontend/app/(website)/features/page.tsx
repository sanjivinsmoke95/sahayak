import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
};

const H = { fontFamily: 'var(--font-display), system-ui' } as const;

const FEATURES = [
  {
    icon: '📄',
    title: 'Document explanation',
    sub: 'Core capability',
    body: 'Upload any government document — certificate, notice, order, or letter — and receive a clear, structured explanation. Sahayak tells you what it is, why you received it, what the key information means, and what the important contents are.',
    bullets: [
      'Reads photos, scanned PDFs, and image files',
      'Works with documents in any condition or clarity',
      'Identifies the document type automatically',
      'Structures the explanation into clear sections',
    ],
    color: '#EAF1FF',
    ink: '#173A78',
  },
  {
    icon: '🌐',
    title: 'Multilingual output',
    sub: 'English · हिंदी · తెలుగు',
    body: 'Every explanation is available in English, Hindi, and Telugu. Switch languages without re-uploading the document — the same document, the same explanation, in the language you're most comfortable with.',
    bullets: [
      'Full explanations in all three languages',
      'Switch instantly with no delay',
      'AI assistant also responds in your chosen language',
      'Language preference saved across sessions',
    ],
    color: '#EAF7F0',
    ink: '#2FA66A',
  },
  {
    icon: '⏰',
    title: 'Deadline and action extraction',
    sub: 'Never miss a date',
    body: 'Deadlines and required actions buried in government documents are identified and surfaced clearly. Sahayak tells you what to do, by when, and what happens if you don\'t act in time.',
    bullets: [
      'Finds submission and renewal deadlines',
      'Extracts required actions explicitly',
      'Highlights the most time-sensitive information',
      'Plain-language descriptions of consequences',
    ],
    color: '#FFF4E7',
    ink: '#C77A1B',
  },
  {
    icon: '💬',
    title: 'AI document assistant',
    sub: 'Ask anything',
    body: 'After the initial explanation, ask follow-up questions in plain language. The assistant understands your specific document and gives grounded, direct answers — with citations from the document itself.',
    bullets: [
      'Questions answered in the context of your document',
      'Citations grounded in the document text',
      'Available in all three languages',
      'Conversation history maintained within a session',
    ],
    color: '#F1ECFB',
    ink: '#6B4EE6',
  },
  {
    icon: '🏦',
    title: 'Government scheme matching',
    sub: 'Know your entitlements',
    body: 'Based on your document, Sahayak identifies which government welfare schemes and benefits you may be eligible for. It shows what other documents you\'ll need to apply and where to go.',
    bullets: [
      'Matches you to relevant schemes automatically',
      'Explains eligibility criteria clearly',
      'Lists the documents required to apply',
      'Links to official scheme information',
    ],
    color: '#EAF1FF',
    ink: '#173A78',
  },
  {
    icon: '📍',
    title: 'Nearby Mee Seva centres',
    sub: 'In-person assistance',
    body: 'When a document requires visiting a government office, Sahayak shows nearby Mee Seva centres on a map. View distance, address, and get directions — so you know exactly where to go.',
    bullets: [
      'Map view of nearest centres',
      'Distance and address for each centre',
      'Links to directions',
      'Specific guidance on what to bring',
    ],
    color: '#EAF7F0',
    ink: '#2FA66A',
  },
];

export default function FeaturesPage() {
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
          <p className="text-xs font-bold uppercase tracking-widest text-[#F4A340] mb-4">Capabilities</p>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl" style={H}>
            Everything Sahayak does
          </h1>
          <p className="mt-5 text-base text-white/55 max-w-xl mx-auto leading-relaxed">
            Built around real problems citizens face when they receive a government document.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {FEATURES.map((f, i) => (
              <div key={f.title}>
                <div className={`grid grid-cols-1 gap-10 lg:grid-cols-2 items-center ${i % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                  {/* Text */}
                  <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: f.color }}
                      >
                        {f.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: f.ink }}>
                          {f.sub}
                        </p>
                        <h2 className="text-2xl font-extrabold text-[#101828]" style={H}>
                          {f.title}
                        </h2>
                      </div>
                    </div>
                    <p className="text-base text-[#667085] leading-relaxed mb-6">{f.body}</p>
                    <ul className="space-y-2.5">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-2.5 text-sm text-[#4A5D75]">
                          <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" style={{ color: f.ink }}>
                            <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual card */}
                  <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                    <div
                      className="rounded-2xl p-8 flex items-center justify-center min-h-[200px]"
                      style={{ background: f.color + '55', border: `1px solid ${f.color}` }}
                    >
                      <div className="text-center">
                        <span className="text-6xl block mb-4">{f.icon}</span>
                        <p className="text-base font-bold" style={{ color: f.ink }}>{f.title}</p>
                        <p className="text-sm text-[#667085] mt-1">{f.sub}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {i < FEATURES.length - 1 && (
                  <div className="mt-20 border-t border-[#F0F0F0]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, #0F2A65 0%, #173A78 50%, #102D63 100%)' }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4" style={H}>
            All of this, for free.
          </h2>
          <p className="text-base text-white/60 max-w-md mx-auto mb-8 leading-relaxed">
            Try Sahayak with any government document — no sign-up required to start.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#102D63] hover:bg-[#EFF5FF] transition-colors shadow-lg"
          >
            Try Sahayak free
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
