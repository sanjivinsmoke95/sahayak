'use client';

import { useRouter } from 'next/navigation';
import { useSettingsStore, useUiStore } from '@/store';
import type { LanguageCode } from '@/types';
import { V2Logo } from './V2Logo';
import { V2Ribbon } from './V2Ribbon';

const GLYPH: Record<LanguageCode, string> = { te: 'తె', hi: 'हि', en: 'En' };

interface V2HeaderProps {
  /** Page-specific controls rendered left of the language button. */
  children?: React.ReactNode;
  /** Set false on the home page so tapping the logo doesn't self-navigate. */
  linkHome?: boolean;
  /** Home keeps its flag beside the greeting; other screens use the top strip. */
  showRibbon?: boolean;
}

/**
 * The single Sahayak header used on every V2 screen. The language badge on
 * the right shows the active language and opens the language picker on tap.
 */
export function V2Header({ children, linkHome = true, showRibbon = true }: V2HeaderProps) {
  const router = useRouter();
  const setDirection = useUiStore((s) => s.setDirection);
  const language = useSettingsStore((s) => s.language);
  const goHome = () => { setDirection('pop'); router.push('/v2'); };
  const goLanguage = () => { setDirection('push'); router.push('/v2/language'); };

  return (
    <header
      className="relative shrink-0 overflow-hidden bg-[#FEF9F3] px-3 pb-1"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}
    >
      {showRibbon && <V2Ribbon placement="top" />}
      <div className="relative flex items-center gap-2 py-2.5">
        {linkHome ? (
          <button
            type="button"
            onClick={goHome}
            aria-label="Sahayak home"
            className="shrink-0 rounded-lg active:opacity-70"
          >
            <V2Logo variant="full" className="h-11 w-auto" />
          </button>
        ) : (
          <V2Logo variant="full" className="h-11 w-auto shrink-0" />
        )}
        <div className="min-w-0 flex-1" />
        {children}
        <button
          type="button"
          onClick={goLanguage}
          aria-label="Change language"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EAF1FF] text-sm font-bold text-[#173A78] active:bg-[#D6E4FF]"
        >
          {GLYPH[language] ?? 'En'}
        </button>
      </div>
    </header>
  );
}
