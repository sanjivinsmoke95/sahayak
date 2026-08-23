'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import type { StringKey } from '@/lib/i18n';

interface Feature {
  icon: string;
  titleKey: StringKey;
  subKey: StringKey;
  href: string;
}

const FEATURES: Feature[] = [
  { icon: 'doc', titleKey: 'help1', subKey: 'help1s', href: '/upload' },
  { icon: 'search', titleKey: 'discFind', subKey: 'discFindSub', href: '/discover' },
  { icon: 'globe', titleKey: 'schBrowseHome', subKey: 'schBrowseHomeSub', href: '/schemes' },
  { icon: 'shrink', titleKey: 'shrinkTitle', subKey: 'shrinkSub', href: '/shrink' },
  { icon: 'tasks', titleKey: 'appMyTitle', subKey: 'help2s', href: '/applications' },
  { icon: 'calendar', titleKey: 'help3', subKey: 'help3s', href: '/deadlines' },
  { icon: 'user', titleKey: 'famManage', subKey: 'famManageSub', href: '/profiles' },
  { icon: 'folder', titleKey: 'help5', subKey: 'help5s', href: '/documents' },
];

export function FeatureList() {
  const router = useRouter();
  const { t } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);

  return (
    <section aria-labelledby="features-heading">
      <h2 id="features-heading" className="mb-4 text-2xl font-bold">
        {t('helpTitle')}
      </h2>
      <div className="space-y-2.5">
        {FEATURES.map((feature) => (
          <button
            key={feature.titleKey}
            type="button"
            onClick={() => {
              setDirection('push');
              router.push(feature.href);
            }}
            className="flex w-full items-center gap-3.5 rounded-xl2 border border-navy-100 bg-white p-4 text-left shadow-soft active:bg-navy-50"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy-50 text-navy-600">
              <Icon name={feature.icon} className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold leading-snug">{t(feature.titleKey)}</span>
              <span className="mt-0.5 line-clamp-2 block text-base leading-snug text-muted">
                {t(feature.subKey)}
              </span>
            </span>
            <Icon name="right" className="h-5 w-5 shrink-0 text-navy-300" />
          </button>
        ))}
      </div>
    </section>
  );
}
