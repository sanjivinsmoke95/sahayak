'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { useUiStore, useWorkspaceStore } from '@/store';
import type { SahayakDocument } from '@/types';

interface Action {
  icon: string;
  label: string;
  onClick: () => void;
}

/** The primary next-actions for a document, as compact rows. */
export function DocumentQuickActions({ document: doc }: { document: SahayakDocument }) {
  const { t } = useTranslation();
  const router = useRouter();
  const setDirection = useUiStore((s) => s.setDirection);
  const setActiveDocumentId = useWorkspaceStore((s) => s.setActiveDocumentId);

  const go = (href: string) => {
    setDirection('push');
    router.push(href);
  };

  const relevant = doc.status === 'action' || !!doc.deadline || (doc.need?.length ?? 0) > 0;

  const actions: Action[] = [{ icon: 'globe', label: t('qaFindSchemes'), onClick: () => go('/schemes') }];
  actions.push({
    icon: 'chat',
    label: t('askAbout'),
    onClick: () => {
      setActiveDocumentId(doc.id);
      go('/assistant');
    },
  });
  if (relevant) {
    actions.push({ icon: 'scan', label: t('meeFindForDoc'), onClick: () => go(`/mee-seva?doc=${doc.id}`) });
  }

  return (
    <section aria-labelledby="doc-quick-actions">
      <h2 id="doc-quick-actions" className="mb-2 text-lg font-bold">
        {t('docQuickActions')}
      </h2>
      <ul className="overflow-hidden rounded-xl2 border border-navy-100 bg-white shadow-soft">
        {actions.map((a, i) => (
          <li key={a.label} className={i > 0 ? 'border-t border-navy-50' : ''}>
            <button
              type="button"
              onClick={a.onClick}
              className="flex w-full items-center gap-3 p-3.5 text-left active:bg-navy-50"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
                <Icon name={a.icon} className="h-5 w-5" />
              </span>
              <span className="flex-1 text-base font-semibold">{a.label}</span>
              <Icon name="right" className="h-5 w-5 shrink-0 text-navy-300" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
