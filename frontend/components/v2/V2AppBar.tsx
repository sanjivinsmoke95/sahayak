'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import { V2Logo } from './V2Logo';
import { V2Ribbon } from './V2Ribbon';
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
  '/v2/mee-seva': 'meeTitle',
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
  const isDocDetail = pathname.startsWith('/v2/documents/') && pathname !== '/v2/documents';
  const titleKey = TITLE_BY_ROUTE[pathname]
    ?? (pathname.startsWith('/v2/documents/') ? 'navDocs'
    : pathname.startsWith('/v2/schemes/') ? 'tabSchemes'
    : pathname.startsWith('/v2/applications/') ? 'appMyTitle'
    : pathname.startsWith('/v2/services/') ? 'appsStartService'
    : 'brand');
  const titleText = isDocDetail ? 'Document Explained' : t(titleKey);

  const share = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Sahayak', url: window.location.href }).catch(() => {});
    }
  };

  const goBack = () => { setDirection('pop'); router.back(); };
  const goProfile = () => { setDirection('push'); router.push('/v2/profile'); };

  if (isHome) {
    return (
      <header
        className="relative shrink-0 overflow-hidden bg-white"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <V2Ribbon placement="top" />
        <div className="relative flex items-center gap-2.5 px-4 py-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EAF1FF]">
            <V2Logo variant="mark" className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="v2-heading text-lg font-extrabold leading-tight text-[#102D63]">Sahayak</p>
            <p className="text-xs text-[#667085]">Your Government Assistant</p>
          </div>
          <button
            type="button"
            onClick={goProfile}
            aria-label={t('tabProfile')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#102D63] active:bg-[#EAF1FF]"
          >
            <Icon name="menu" className="h-6 w-6" strokeWidth={2.2} />
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
          {titleText}
        </p>

        {isDocDetail ? (
          <button
            type="button"
            onClick={share}
            aria-label="Share"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#102D63] active:bg-[#EAF1FF]"
          >
            <Icon name="share" className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setLanguageSheetOpen(true)}
            aria-label={t('language')}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#667085] active:bg-[#EAF1FF]"
          >
            <Icon name="globe" className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
