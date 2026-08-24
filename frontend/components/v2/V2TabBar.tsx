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
  { href: '/v2', labelKey: 'navHome', icon: 'home' },
  { href: '/v2/documents', labelKey: 'shortDocs', icon: 'folder' },
  { href: '/v2/schemes', labelKey: 'tabSchemes', icon: 'globe' },
  { href: '/v2/applications', labelKey: 'tabApps', icon: 'tasks' },
  { href: '/v2/assistant', labelKey: 'tabAsk', icon: 'chat' },
];

export function V2TabBar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

  return (
    <nav
      aria-label="Main navigation"
      className="shrink-0 border-t border-[#D8D0C7] bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.href === '/v2'
            ? pathname === '/v2'
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              onClick={() => { buzz(); setDirection('tab'); }}
              className={cn(
                'flex flex-col items-center gap-1 pb-1.5 pt-2 transition',
                active ? 'text-[#0C6E6B]' : 'text-[#7A6E68]',
              )}
            >
              <span className={cn('rounded-full px-4 py-0.5 transition', active && 'bg-[#E1F0EF]')}>
                <Icon name={tab.icon} className="h-6 w-6" strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className={cn('text-[0.6875rem] leading-tight', active ? 'font-bold' : 'font-medium')}>
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
