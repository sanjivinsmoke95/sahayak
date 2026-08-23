'use client';

import { useTranslation } from '@/hooks';

export function AppFooter() {
  const { t } = useTranslation();
  return (
    <footer className="mt-10 space-y-2 border-t border-navy-100 pt-6 text-base text-muted print:hidden">
      <p className="leading-relaxed">{t('disclaimer')}</p>
    </footer>
  );
}
