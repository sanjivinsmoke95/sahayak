'use client';

import { useRouter } from 'next/navigation';
import { SectionCard } from '@/components/common';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import { GOV_SERVICES } from '@/lib/data/gov-services';
import { documentSatisfies } from '@/lib/requirement-match';
import { useUiStore } from '@/store';
import type { SahayakDocument } from '@/types';

/** Services this document helps with — a bridge from a document to a workflow. */
export function RelevantServices({ document: doc }: { document: SahayakDocument }) {
  const { t, tr } = useTranslation();
  const router = useRouter();
  const setDirection = useUiStore((s) => s.setDirection);

  const relevant = GOV_SERVICES.filter((service) =>
    service.documents.some((req) => documentSatisfies(req.en, doc)),
  );
  if (relevant.length === 0) return null;

  return (
    <SectionCard icon="tasks" tone="navy" title={t('svcRelevant')}>
      <ul className="space-y-2.5">
        {relevant.map((service) => (
          <li key={service.id}>
            <button
              type="button"
              onClick={() => {
                setDirection('push');
                router.push(`/services/${service.id}`);
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-navy-50 px-3 py-2.5 text-left text-navy-700 active:bg-navy-100"
            >
              <Icon name={service.icon} className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-base font-semibold">
                {tr(service.title)}
              </span>
              <Icon name="right" className="h-4 w-4 shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
