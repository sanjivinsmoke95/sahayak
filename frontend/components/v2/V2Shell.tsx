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
  const isDocDetail = pathname.startsWith('/v2/documents/') && pathname !== '/v2/documents';
  const ownHeader = isHome || isDocDetail;

  return (
    <div className="v2-wrap">
      <div className="v2-device">
        {!ownHeader && <V2AppBar />}
        <BackendStatusBanner />
        <main
          id="main"
          ref={scrollRef}
          tabIndex={-1}
          className={ownHeader ? 'v2-scroll' : 'v2-scroll px-4 pb-10 pt-5'}
        >
          {children}
        </main>
        <V2TabBar />
        <LanguageSheet />
      </div>
    </div>
  );
}
