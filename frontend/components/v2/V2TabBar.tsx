'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import type { StringKey } from '@/lib/i18n';
import { buzz } from '@/utils/format';

interface Tab {
  href: string;
  labelKey: StringKey;
  icon: string;
  match: (path: string) => boolean;
}

const TABS: Tab[] = [
  { href: '/v2', labelKey: 'navHome', icon: 'home', match: (p) => p === '/v2' },
  {
    href: '/v2/documents',
    labelKey: 'shortDocs',
    icon: 'folder',
    match: (p) => p.startsWith('/v2/documents'),
  },
  {
    href: '/v2/alerts',
    labelKey: 'tabAlerts',
    icon: 'bell',
    match: (p) => p.startsWith('/v2/alerts'),
  },
  {
    href: '/v2/profile',
    labelKey: 'tabProfile',
    icon: 'user',
    match: (p) =>
      p.startsWith('/v2/profile') ||
      p.startsWith('/v2/settings') ||
      p.startsWith('/v2/profiles'),
  },
];

export function V2TabBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

  return (
    <nav
      aria-label="Main navigation"
      className="shrink-0 border-t border-[#E8EDF5] bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              onClick={() => { buzz(); setDirection('tab'); }}
              className={cn(
                'flex flex-col items-center gap-1 pb-1.5 pt-2.5 transition',
                active ? 'text-[#102D63]' : 'text-[#667085]',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-[12px] transition',
                  active ? 'bg-[#EAF1FF]' : 'bg-transparent',
                )}
              >
                <Icon name={tab.icon} className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.9} />
              </span>
              <span className={cn('text-[0.625rem] leading-tight', active ? 'font-bold' : 'font-medium')}>
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
