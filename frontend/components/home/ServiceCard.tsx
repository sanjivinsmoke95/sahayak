'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { useUiStore } from '@/store';
import { cn } from '@/lib/utils';
import type { CitizenService, Localized } from '@/types';

/**
 * One government service, expandable. Collapsed it shows the name and who it is
 * for; opened it lists the papers, the steps and where to apply. Reused for
 * every service in the directory — the content is data, the card is this.
 */
export function ServiceCard({ service }: { service: CitizenService }) {
  const { t, tr } = useTranslation();
  const router = useRouter();
  const setDirection = useUiStore((s) => s.setDirection);
  const [open, setOpen] = useState(false);

  const goFindCentre = () => {
    setDirection('push');
    router.push(`/mee-seva?service=${service.id}`);
  };

  const goWorkflow = () => {
    setDirection('push');
    router.push(`/services/${service.id}`);
  };

  return (
    <div className="overflow-hidden rounded-xl2 border border-navy-100 bg-white shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3.5 p-4 text-left active:bg-navy-50"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy-50 text-navy-600">
          <Icon name={service.icon} className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold leading-snug">{tr(service.title)}</span>
          <span className="mt-0.5 line-clamp-2 block text-base leading-snug text-muted">
            {tr(service.forWhom)}
          </span>
        </span>
        <Icon
          name={open ? 'up' : 'down'}
          className="h-5 w-5 shrink-0 text-navy-300"
          strokeWidth={2.4}
        />
      </button>

      {open && (
        <div className="animate-rise space-y-4 border-t border-navy-100 p-4">
          {service.deadline && (
            <div className="flex items-start gap-2.5 rounded-xl bg-amberx-50 p-3 text-amberx-700">
              <Icon name="calendar" className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-base leading-relaxed">{tr(service.deadline)}</p>
            </div>
          )}

          <List title={t('svcDocs')} icon="doc" tone="leaf" items={service.documents} tr={tr} />
          <List title={t('svcSteps')} icon="tasks" tone="navy" items={service.steps} tr={tr} ordered />

          <div>
            <h4 className="mb-1.5 flex items-center gap-2 text-base font-bold">
              <Icon name="folder" className="h-5 w-5 text-navy-500" />
              {t('svcWhere')}
            </h4>
            <p className="text-base leading-relaxed text-ink">{tr(service.where)}</p>
          </div>

          <p className="rounded-xl bg-navy-50 p-3 text-sm leading-relaxed text-muted">
            {t('svcConfirm')}
          </p>

          <Button full size="md" onClick={goWorkflow}>
            <Icon name="right" className="h-5 w-5" />
            {t('svcOpen')}
          </Button>
          {service.meeSeva && (
            <Button full size="md" variant="secondary" onClick={goFindCentre}>
              <Icon name="search" className="h-5 w-5" />
              {t('svcFindCentre')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function List({
  title,
  icon,
  tone,
  items,
  tr,
  ordered,
}: {
  title: string;
  icon: string;
  tone: 'leaf' | 'navy';
  items: Localized[];
  tr: (v: Localized | undefined) => string;
  ordered?: boolean;
}) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-base font-bold">
        <Icon name={icon} className={cn('h-5 w-5', tone === 'leaf' ? 'text-leaf-600' : 'text-navy-500')} />
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5 text-base leading-relaxed">
            {ordered ? (
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-100 text-xs font-bold text-navy-700">
                {index + 1}
              </span>
            ) : (
              <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} />
            )}
            <span>{tr(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
