'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { useSettingsStore, useUiStore } from '@/store';
import type { StringKey } from '@/lib/i18n';

const TAB_ROOTS = ['/v2', '/v2/documents', '/v2/schemes', '/v2/applications', '/v2/assistant'];

const TITLE_BY_ROUTE: Record<string, StringKey> = {
  '/v2/upload': 'btnUpload',
  '/v2/analyzing': 'anTitle',
  '/v2/documents': 'shortDocs',
  '/v2/schemes': 'tabSchemes',
  '/v2/applications': 'appMyTitle',
  '/v2/assistant': 'navAsk',
  '/v2/settings': 'navSettings',
  '/v2/profiles': 'famTitle',
};

export function V2AppBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const displayName = useSettingsStore((s) => s.displayName);
  const setDirection = useUiStore((s) => s.setDirection);
  const setLanguageSheetOpen = useUiStore((s) => s.setLanguageSheetOpen);

  const isTabRoot = TAB_ROOTS.includes(pathname);
  const isHome = pathname === '/v2';
  const titleKey = TITLE_BY_ROUTE[pathname]
    ?? (pathname.startsWith('/v2/documents/') ? 'navDocs'
    : pathname.startsWith('/v2/schemes/') ? 'tabSchemes'
    : pathname.startsWith('/v2/applications/') ? 'appMyTitle'
    : pathname.startsWith('/v2/services/') ? 'appsStartService'
    : 'brand');

  const goBack = () => { setDirection('pop'); router.back(); };
  const initial = (displayName || 'S')[0].toUpperCase();

  if (isHome) {
    return (
      <header
        className="shrink-0 bg-white"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0C6E6B] text-white">
            <span className="v2-heading text-sm font-bold">{initial}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="v2-heading text-base font-bold text-[#19120E]">{t('brand')}</p>
            <p className="text-xs text-[#7A6E68]">{t('tagline')}</p>
          </div>
          <button
            type="button"
            onClick={() => setLanguageSheetOpen(true)}
            aria-label={t('language')}
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#0C6E6B] active:bg-[#E1F0EF]"
          >
            <Icon name="globe" className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#C0392B]" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header
      className="shrink-0 bg-white"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {!isTabRoot ? (
          <button
            type="button"
            onClick={goBack}
            aria-label={t('back')}
            className="-ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#0C6E6B] active:bg-[#E1F0EF]"
          >
            <Icon name="left" className="h-6 w-6" strokeWidth={2.4} />
          </button>
        ) : (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#E1F0EF] text-[#0C6E6B]">
            <Icon name="home" className="h-5 w-5" />
          </div>
        )}

        <p className="v2-heading min-w-0 flex-1 truncate px-1 text-lg font-bold text-[#19120E]">
          {t(titleKey)}
        </p>

        <button
          type="button"
          onClick={() => setLanguageSheetOpen(true)}
          aria-label={t('language')}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#7A6E68] active:bg-[#E1F0EF]"
        >
          <Icon name="settings" className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
