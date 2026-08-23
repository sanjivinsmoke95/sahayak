'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { LANGS } from '@/lib/i18n';
import { useUiStore } from '@/store';
import type { StringKey } from '@/lib/i18n';
import { Logo } from './Logo';
import { OfflineBanner } from './OfflineBanner';
import { BackendStatusBanner } from '@/components/common';

/** Routes that are tab roots show the logo; everything else shows a back arrow. */
const TAB_ROOTS = ['/', '/documents', '/schemes', '/applications', '/assistant'];

const TITLE_BY_ROUTE: Record<string, StringKey> = {
  '/': 'brand',
  '/upload': 'btnUpload',
  '/analyzing': 'anTitle',
  '/documents': 'docsTitle',
  '/schemes': 'schBrowse',
  '/applications': 'appMyTitle',
  '/discover': 'discTitle',
  '/profiles': 'famTitle',
  '/actions': 'navActions',
  '/deadlines': 'navDeadlines',
  '/assistant': 'askTitle',
  '/settings': 'setTitle',
  '/shrink': 'navShrink',
};

export function AppBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useTranslation();
  const setLanguageSheetOpen = useUiStore((s) => s.setLanguageSheetOpen);
  const setDirection = useUiStore((s) => s.setDirection);

  const canBack = !TAB_ROOTS.includes(pathname);
  const titleKey = TITLE_BY_ROUTE[pathname] ?? (pathname.startsWith('/documents/') ? 'navDocs' : 'brand');
  const current = LANGS.find((l) => l.code === language);

  const goBack = () => {
    setDirection('pop');
    router.back();
  };

  return (
    <header
      className="shrink-0 border-b border-navy-100 bg-white print:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {canBack ? (
          <button
            type="button"
            onClick={goBack}
            aria-label={t('back')}
            className="-ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy-700 active:bg-navy-50"
          >
            <Icon name="left" className="h-6 w-6" strokeWidth={2.4} />
          </button>
        ) : (
          <Logo className="ml-1 h-10 w-10" />
        )}

        <h1 className="min-w-0 flex-1 truncate px-1 text-xl font-bold">{t(titleKey)}</h1>

        <button
          type="button"
          onClick={() => setLanguageSheetOpen(true)}
          aria-label={t('language')}
          className="grid h-11 shrink-0 place-items-center rounded-full bg-navy-50 px-3 text-base font-bold text-navy-700 active:bg-navy-100"
        >
          {current?.native ?? 'A'}
        </button>
        <button
          type="button"
          onClick={() => {
            setDirection('push');
            router.push('/settings');
          }}
          aria-label={t('navSettings')}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy-700 active:bg-navy-50"
        >
          <Icon name="sliders" className="h-6 w-6" />
        </button>
      </div>

      <OfflineBanner />
      <BackendStatusBanner />
    </header>
  );
}
