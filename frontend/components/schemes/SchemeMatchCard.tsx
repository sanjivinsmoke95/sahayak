'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks';
import { TAG_LABEL } from '@/lib/scheme-tags';
import { useUiStore } from '@/store';
import type { SchemeMatch } from '@/types';

/**
 * A recommended scheme, in the reference's card style: name, a document-readiness
 * badge, a few requirement rows (met / still needed), and one primary action.
 * Framed around documents — never an eligibility claim.
 */
export function SchemeMatchCard({ scheme }: { scheme: SchemeMatch }) {
  const { t } = useTranslation();
  const router = useRouter();
  const setDirection = useUiStore((s) => s.setDirection);

  const ready = scheme.satisfied === scheme.total;
  const rows = [
    ...scheme.matchedTags.map((tag) => ({ tag, met: true })),
    ...scheme.missingTags.map((tag) => ({ tag, met: false })),
  ]
    .filter((r) => TAG_LABEL[r.tag])
    .slice(0, 4);

  const open = () => {
    setDirection('push');
    router.push(`/schemes/${scheme.id}`);
  };

  return (
    <div className="rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
          <Icon name="globe" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold leading-snug">{scheme.name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
            <span
              className={ready ? 'h-2 w-2 rounded-full bg-leaf-600' : 'h-2 w-2 rounded-full bg-amberx-500'}
            />
            <span className={ready ? 'text-leaf-700' : 'text-amberx-700'}>
              {ready ? t('schDocsReady') : t('schMoreNeeded')}
            </span>
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <li key={r.tag} className="flex items-center gap-2 text-sm">
            {r.met ? (
              <Icon name="check" className="h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} />
            ) : (
              <Icon name="alert" className="h-4 w-4 shrink-0 text-amberx-500" />
            )}
            <span className={r.met ? '' : 'text-muted'}>{t(TAG_LABEL[r.tag])}</span>
          </li>
        ))}
      </ul>

      <Button className="mt-3.5" full size="md" onClick={open}>
        {t('schCheckEligibility')}
        <Icon name="right" className="h-5 w-5" />
      </Button>
    </div>
  );
}
