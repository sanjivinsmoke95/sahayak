'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const F = { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" } as const;

const NAV = [
  { href: '/app/dashboard', icon: HomeIcon, label: 'Dashboard' },
  { href: '/app/upload', icon: UploadIcon, label: 'Upload document' },
  { href: '/app/documents', icon: DocsIcon, label: 'My documents' },
  { href: '/app/chat', icon: ChatIcon, label: 'AI assistant' },
  { href: '/app/schemes', icon: SchemeIcon, label: 'Schemes' },
  { href: '/app/services', icon: ServicesIcon, label: 'Gov services' },
];

export default function SahayakLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div style={{ ...F, display: 'flex', minHeight: '100dvh', background: 'var(--sh-bg)' }} className="sh-app-body">
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: 'var(--sh-deep-navy)',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100dvh',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#1557B0" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: 17, color: 'white', letterSpacing: '-0.01em' }}>Sahayak</span>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = path === href || (href !== '/app/dashboard' && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                  fontSize: 14, fontWeight: active ? 600 : 500,
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
                  textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
                }}
              >
                <Icon active={active} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Settings at bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link
            href="/app/settings"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8,
              fontSize: 14, fontWeight: 500,
              color: path === '/app/settings' ? '#fff' : 'rgba(255,255,255,0.55)',
              background: path === '/app/settings' ? 'rgba(255,255,255,0.10)' : 'transparent',
              textDecoration: 'none',
            }}
          >
            <SettingsIcon active={path === '/app/settings'} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', minHeight: '100dvh' }}>
        {children}
      </main>
    </div>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2.25 7.5L9 2.25L15.75 7.5V15A.75.75 0 0115 15.75H12A.75.75 0 0111.25 15V11.25H6.75V15A.75.75 0 016 15.75H3A.75.75 0 012.25 15V7.5Z"
        stroke={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
function UploadIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3 12.75V14.25C3 14.664 3.336 15 3.75 15H14.25C14.664 15 15 14.664 15 14.25V12.75M9 3V11.25M9 3L5.25 6.75M9 3L12.75 6.75"
        stroke={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DocsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10.5 2.25H4.5A1.5 1.5 0 003 3.75V14.25A1.5 1.5 0 004.5 15.75H13.5A1.5 1.5 0 0015 14.25V6.75L10.5 2.25Z"
        stroke={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 2.25V6.75H15M6.75 9.75H11.25M6.75 12.75H11.25"
        stroke={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2.25 3.75A1.5 1.5 0 013.75 2.25H14.25A1.5 1.5 0 0115.75 3.75V11.25A1.5 1.5 0 0114.25 12.75H10.5L7.5 15.75V12.75H3.75A1.5 1.5 0 012.25 11.25V3.75Z"
        stroke={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SchemeIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M9 1.5L11.163 6.385L16.5 7.11L12.75 10.648L13.727 15.75L9 13.25L4.273 15.75L5.25 10.648L1.5 7.11L6.837 6.385L9 1.5Z"
        stroke={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ServicesIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path d="M15.75 12.75A.75.75 0 0115 13.5H3A.75.75 0 012.25 12.75V5.25A.75.75 0 013 4.5H6.75L9 2.25L11.25 4.5H15A.75.75 0 0115.75 5.25V12.75Z"
        stroke={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="9" cy="9" r="2.25" stroke={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" />
      <path d="M9 1.5v1.875M9 14.625V16.5M1.5 9h1.875M14.625 9H16.5M3.443 3.443l1.327 1.327M13.23 13.23l1.327 1.327M3.443 14.557l1.327-1.327M13.23 4.77l1.327-1.327"
        stroke={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
