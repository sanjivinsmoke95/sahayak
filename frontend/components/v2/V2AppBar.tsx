'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import { V2Logo } from './V2Logo';
import type { StringKey } from '@/lib/i18n';

const TAB_ROOTS = ['/v2', '/v2/documents', '/v2/alerts', '/v2/profile'];

const TITLE_BY_ROUTE: Record<string, StringKey> = {
  '/v2/upload': 'btnUpload',
  '/v2/analyzing': 'anTitle',
  '/v2/success': 'successTitle',
  '/v2/documents': 'shortDocs',
  '/v2/alerts': 'alertsTitle',
  '/v2/profile': 'profileTitle',
  '/v2/schemes': 'tabSchemes',
  '/v2/applications': 'appMyTitle',
  '/v2/assistant': 'voiceTitle',
  '/v2/settings': 'navSettings',
  '/v2/profiles': 'famTitle',
};

export function V2AppBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
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
  const goAlerts = () => { setDirection('push'); router.push('/v2/alerts'); };

  if (isHome) {
    return (
      <header
        className="shrink-0 border-b border-[#EAF1FF] bg-white"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2.5 px-4 py-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EAF1FF]">
            <V2Logo variant="mark" className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="v2-heading text-lg font-extrabold leading-tight text-[#102D63]">{t('brand')}</p>
            <p className="text-xs text-[#667085]">{t('tagline')}</p>
          </div>
          <button
            type="button"
            onClick={goAlerts}
            aria-label={t('alertsTitle')}
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#102D63] active:bg-[#EAF1FF]"
          >
            <Icon name="bell" className="h-6 w-6" />
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#F4A340]" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header
      className="shrink-0 border-b border-[#EAF1FF] bg-white"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {!isTabRoot ? (
          <button
            type="button"
            onClick={goBack}
            aria-label={t('back')}
            className="-ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#102D63] active:bg-[#EAF1FF]"
          >
            <Icon name="left" className="h-6 w-6" strokeWidth={2.4} />
          </button>
        ) : (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EAF1FF]">
            <V2Logo variant="mark" className="h-6 w-6" />
          </div>
        )}

        <p className="v2-heading min-w-0 flex-1 truncate px-1 text-lg font-bold text-[#102D63]">
          {t(titleKey)}
        </p>

        <button
          type="button"
          onClick={() => setLanguageSheetOpen(true)}
          aria-label={t('language')}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#667085] active:bg-[#EAF1FF]"
        >
          <Icon name="globe" className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
