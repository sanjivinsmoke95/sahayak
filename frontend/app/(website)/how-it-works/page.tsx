import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
};

const H = { fontFamily: 'var(--font-display), system-ui' } as const;

const STEPS = [
  {
    n: '01',
    title: 'Upload your document',
    body: 'Take a photo of any government document — certificate, notice, letter, or order. You can also upload a scanned PDF or an existing image from your phone. Sahayak accepts documents in any condition: low resolution, printed on coloured paper, or partially faded.',
    note: 'Supported: JPG, PNG, HEIC, PDF (any page count)',
    icon: '📤',
    color: '#EAF1FF',
    ink: '#173A78',
  },
  {
    n: '02',
    title: 'Sahayak identifies the document',
    body: 'Our AI reads the document text using OCR and identifies what kind of document it is — income certificate, caste certificate, pension notice, land record, and many more. It extracts the key fields: dates, names, reference numbers, issuing authority, and deadlines.',
    note: 'Works even with unclear handwriting or stamps',
    icon: '🔍',
    color: '#EAF7F0',
    ink: '#2FA66A',
  },
  {
    n: '03',
    title: 'You get a plain-language explanation',
    body: 'Sahayak produces a structured explanation in the language of your choice — English, Hindi, or Telugu. It tells you what the document is, why you received it, and what the important contents mean in plain terms. No jargon, no ambiguity.',
    note: 'Switch languages instantly without re-uploading',
    icon: '💡',
    color: '#FFF4E7',
    ink: '#C77A1B',
  },
  {
    n: '04',
    title: 'Know exactly what to do — and by when',
    body: 'The most valuable part: Sahayak identifies every action the document requires. Submit by a date, renew within a window, visit a particular office, bring specific documents — it extracts all of this and presents it as a clear action plan, with deadlines highlighted.',
    note: 'Deadlines are extracted and displayed prominently',
    icon: '✅',
    color: '#F1ECFB',
    ink: '#6B4EE6',
  },
];

const FAQS = [
  {
    q: 'What kinds of documents does Sahayak support?',
    a: 'Sahayak works with most official government documents — income certificates, caste certificates, residence certificates, land records (pahani, ROR), pension orders, ration card letters, tax notices, scheme benefit letters, and more.',
  },
  {
    q: 'What languages are supported?',
    a: 'Explanations are available in English, Hindi, and Telugu. You can switch language at any time without re-uploading the document.',
  },
  {
    q: 'How accurate is the explanation?',
    a: 'Sahayak uses an AI model that reads the actual contents of your document. It does not guess or make things up — its explanations are grounded in the text of the document you uploaded. For critical decisions, always verify with the issuing authority.',
  },
  {
    q: 'Is my document stored or shared?',
    a: 'Your document is processed to generate the explanation and associated analysis. It is not shared with any third party or government body. You can delete your documents from your account at any time.',
  },
  {
    q: 'Can I ask follow-up questions?',
    a: 'Yes. After the initial explanation, Sahayak provides an AI assistant that understands your specific document. You can ask anything — "What is the last date?", "Where do I submit this?", "What scheme can I apply for with this?" — and get grounded answers.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Header */}
      <section
        className="pt-28 pb-16"
        style={{ background: 'linear-gradient(160deg, #07111F 0%, #0F2A65 50%, #0A1E3C 100%)' }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: 'linear-gradient(to right, #FF9933 33.33%, #fff 33.33%, #fff 66.66%, #138808 66.66%)' }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#F4A340] mb-4">Process</p>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl" style={H}>
            How Sahayak works
          </h1>
          <p className="mt-5 text-base text-white/55 max-w-xl mx-auto leading-relaxed">
            From upload to action plan in minutes — here's exactly what happens to your document.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex gap-6 sm:gap-10">
                {/* Step number column */}
                <div className="flex flex-col items-center">
                  <div
                    className="h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center text-sm font-extrabold"
                    style={{ backgroundColor: s.color, color: s.ink }}
                  >
                    {s.n}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="mt-4 w-px flex-1 border-l-2 border-dashed border-[#E5E7EB]" style={{ minHeight: '3rem' }} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{s.icon}</span>
                    <h2 className="text-xl font-extrabold text-[#101828]" style={H}>
                      {s.title}
                    </h2>
                  </div>
                  <p className="text-base text-[#667085] leading-relaxed mb-4">{s.body}</p>
                  <div
                    className="inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium"
                    style={{ backgroundColor: s.color, color: s.ink }}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {s.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F8FAFC] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-[#101828] mb-10" style={H}>
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
                <h3 className="text-base font-bold text-[#101828] mb-2" style={H}>
                  {faq.q}
                </h3>
                <p className="text-sm text-[#667085] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-[#101828] mb-4" style={H}>
            Ready to try it yourself?
          </h2>
          <p className="text-base text-[#667085] mb-8 max-w-md mx-auto">
            Upload any government document and Sahayak will explain it clearly in minutes.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#102D63] px-7 py-3.5 text-sm font-bold text-white hover:bg-[#173A78] transition-colors shadow-[0_4px_16px_rgba(16,45,99,0.25)]"
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
