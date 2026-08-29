'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useSettingsSync, useTranslation } from '@/hooks';
import { TEXT_SIZES } from '@/lib/i18n';
import { useSettingsStore } from '@/store';
import { LanguageSheet } from '@/components/layout/LanguageSheet';
import { BackendStatusBanner } from '@/components/common';
import { V2AppBar } from './V2AppBar';
import { V2TabBar } from './V2TabBar';

export function V2Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLElement>(null);
  const textSize = useSettingsStore((s) => s.textSize);
  const { language } = useTranslation();

  useSettingsSync();

  useEffect(() => {
    document.documentElement.style.fontSize = `${TEXT_SIZES[textSize]}px`;
  }, [textSize]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [pathname]);

  const isHome = pathname === '/v2';
  // Only the exact document detail owns its header; sub-routes (e.g. /plan)
  // keep the shared app bar.
  const isDocDetail = /^\/v2\/documents\/[^/]+$/.test(pathname);
  const ownHeader = isHome || isDocDetail;

  return (
    <div className="v2-wrap">
      <div className="v2-device">
        <BackendStatusBanner />
        <main id="main" ref={scrollRef} tabIndex={-1} className="v2-scroll">
          {/* The header scrolls inside the body so every page is one continuous
              block — the app bar and content are never two separate panes. */}
          {!ownHeader && <V2AppBar />}
          {ownHeader ? children : <div className="px-4 pb-10 pt-4">{children}</div>}
        </main>
        <V2TabBar />
        <LanguageSheet />
      </div>
    </div>
  );
}
