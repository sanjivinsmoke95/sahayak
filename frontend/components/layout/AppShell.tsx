'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSettingsSync, useTranslation } from '@/hooks';
import { TEXT_SIZES } from '@/lib/i18n';
import { useSettingsStore } from '@/store';
import { AppBar } from './AppBar';
import { LanguageSheet } from './LanguageSheet';
import { PhoneFrame } from './PhoneFrame';
import { ScreenTransition } from './ScreenTransition';
import { Splash } from './Splash';
import { StatusBar } from './StatusBar';
import { TabBar } from './TabBar';

/**
 * One fixed viewport, one scrolling region, a header and a tab bar that never
 * move — the three things that make a web app feel like a phone app.
 */
export function AppShell({ children }: { children: ReactNode }) {
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

  // Every screen starts at the top, as a pushed native screen does.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [pathname]);

  return (
    <PhoneFrame>
      <StatusBar />
      <AppBar />
      <main id="main" ref={scrollRef} tabIndex={-1} className="app-scroll px-4 pb-10 pt-5">
        <ScreenTransition>{children}</ScreenTransition>
      </main>
      <TabBar />
      <LanguageSheet />
      <Splash />
    </PhoneFrame>
  );
}
