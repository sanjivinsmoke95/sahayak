'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Features', href: '/features' },
  { label: 'Impact', href: '/impact' },
];

export function WebNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isHero = path === '/';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-[0_1px_0_#E5E7EB]'
          : isHero
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-sm shadow-[0_1px_0_#E5E7EB]'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-8">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2.5">
            <img
              src="/v2-assets/logo-full.svg"
              alt="Sahayak"
              className="h-8 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span
              className={`text-lg font-extrabold tracking-tight ${scrolled || !isHero ? 'text-[#102D63]' : 'text-white'}`}
              style={{ fontFamily: 'var(--font-display), system-ui' }}
            >
              sahayak
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium transition-colors ${
                  path === l.href
                    ? scrolled || !isHero
                      ? 'text-[#102D63]'
                      : 'text-white'
                    : scrolled || !isHero
                    ? 'text-[#4A5D75] hover:text-[#102D63]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1 md:flex-none" />

          {/* CTA */}
          <Link
            href="/app"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-[#102D63] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#173A78] transition-colors shadow-[0_2px_8px_rgba(16,45,99,0.25)] active:scale-95"
          >
            Try Sahayak
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            className={`flex md:hidden h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              scrolled || !isHero ? 'text-[#4A5D75] hover:bg-[#EAF1FF]' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            {open ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB]">
          <div className="mx-auto max-w-6xl px-4 py-3 space-y-0.5">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[#101828] rounded-lg hover:bg-[#F5F8FF] transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 pb-1">
              <Link
                href="/app"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-[#102D63] px-5 py-3 text-sm font-semibold text-white"
              >
                Try Sahayak
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
