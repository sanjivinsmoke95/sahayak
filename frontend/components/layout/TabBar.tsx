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
}

const TABS: Tab[] = [
  { href: '/', labelKey: 'navHome', icon: 'home' },
  { href: '/documents', labelKey: 'shortDocs', icon: 'folder' },
  { href: '/schemes', labelKey: 'tabSchemes', icon: 'globe' },
  { href: '/applications', labelKey: 'tabApps', icon: 'tasks' },
  { href: '/assistant', labelKey: 'tabAsk', icon: 'chat' },
];

export function TabBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

  return (
    <nav
      aria-label={t('navHome')}
      className="shrink-0 border-t border-navy-100 bg-white print:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                buzz();
                setDirection('tab');
              }}
              className={cn(
                'flex flex-col items-center gap-1 pb-1.5 pt-2 transition',
                active ? 'text-navy-600' : 'text-muted',
              )}
            >
              <span className={cn('rounded-full px-4 py-0.5 transition', active && 'bg-navy-50')}>
                <Icon name={tab.icon} className="h-6 w-6" strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className={cn('text-[11px] leading-tight', active ? 'font-bold' : 'font-medium')}>
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
