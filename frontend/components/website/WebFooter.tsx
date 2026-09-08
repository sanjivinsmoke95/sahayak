import Link from 'next/link';

const PRODUCT_LINKS = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Features', href: '/features' },
  { label: 'Impact', href: '/impact' },
  { label: 'Try Sahayak', href: '/app' },
];

const APP_LINKS = [
  { label: 'Upload a document', href: '/v2/upload' },
  { label: 'My documents', href: '/v2/documents' },
  { label: 'Government schemes', href: '/v2/schemes' },
  { label: 'Mee Seva centres', href: '/v2/mee-seva' },
  { label: 'AI Assistant', href: '/v2/assistant' },
];

export function WebFooter() {
  return (
    <footer className="bg-[#0A1E3C]">
      {/* Top border — tricolor thin line */}
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%)' }} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand — spans 2 cols on md */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/v2-assets/logo-mark-white.svg"
                alt="Sahayak"
                className="h-9 w-auto"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="text-xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display), system-ui' }}>
                sahayak
              </span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-[300px]">
              Helping citizens understand government documents in plain language —
              in English, Hindi, and Telugu.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['English', 'हिंदी', 'తెలుగు'].map((l) => (
                <span
                  key={l}
                  className="text-xs font-medium text-white/50 border border-white/10 bg-white/5 px-3 py-1 rounded-full"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Product</p>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/55 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* App links */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Application</p>
            <ul className="space-y-3">
              {APP_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/55 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/8 pt-8 space-y-2">
          <p className="text-xs text-white/30 leading-relaxed max-w-2xl">
            Sahayak is an independent citizen-service tool. It is not an official government portal,
            does not provide legal advice, and is not affiliated with or endorsed by any government
            department. Always verify important information with the issuing authority.
          </p>
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} Sahayak · Built for India's citizens
          </p>
        </div>
      </div>
    </footer>
  );
}
