'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import type { StringKey } from '@/lib/i18n';
import { useUiStore } from '@/store';

const ACTIONS: { icon: string; labelKey: StringKey; href: string }[] = [
  { icon: 'globe', labelKey: 'qaFindSchemes', href: '/schemes' },
  { icon: 'folder', labelKey: 'qaCheckDoc', href: '/documents' },
  { icon: 'tasks', labelKey: 'qaMyApps', href: '/applications' },
  { icon: 'chat', labelKey: 'qaAsk', href: '/assistant' },
];

/** Four compact quick actions into the app's main destinations. */
export function HomeQuickActions() {
  const router = useRouter();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

  return (
    <section aria-labelledby="qa-heading">
      <h2 id="qa-heading" className="mb-3 text-lg font-bold">
        {t('helpTitle')}
      </h2>
      <div className="grid grid-cols-4 gap-2.5">
        {ACTIONS.map((a) => (
          <button
            key={a.href}
            type="button"
            onClick={() => {
              setDirection('push');
              router.push(a.href);
            }}
            className="flex flex-col items-center gap-2 rounded-xl2 border border-navy-100 bg-white p-3 text-center shadow-soft active:bg-navy-50"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy-50 text-navy-600">
              <Icon name={a.icon} className="h-5 w-5" />
            </span>
            <span className="text-xs font-semibold leading-tight">{t(a.labelKey)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
