'use client';

import { useRouter } from 'next/navigation';
import { SectionCard } from '@/components/common';
import { Button, Progress } from '@/components/ui';
import { useToggleChecklistItem, useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import type { Checklist, SahayakDocument } from '@/types';
import { Icon } from '@/components/common';

interface StepChecklistProps {
  document: SahayakDocument;
  checklist: Checklist | undefined;
  kind: 'steps' | 'need';
}

/**
 * Two kinds of list. `steps` are actions the reader ticks off by hand,
 * optimistically written through to FastAPI. `need` — the required documents —
 * is not hand-ticked: each line turns green only when a matching document has
 * actually been uploaded and detected, so a missing paper can never be marked
 * done by mistake.
 */
export function StepChecklist({ document: doc, checklist, kind }: StepChecklistProps) {
  const { t, tr } = useTranslation();
  const router = useRouter();
  const setDirection = useUiStore((s) => s.setDirection);
  const toggle = useToggleChecklistItem();

  const items = kind === 'steps' ? doc.steps : doc.need;
  const ticks = checklist?.[kind] ?? {};
  const doneCount = items.filter((_, i) => ticks[i]).length;
  const isNeed = kind === 'need';

  if (items.length === 0) return null;

  return (
    <SectionCard
      icon={isNeed ? 'doc' : 'tasks'}
      tone={isNeed ? 'leaf' : 'navy'}
      title={isNeed ? t('secNeed') : t('secDo')}
    >
      {isNeed && <p className="-mt-1 mb-3 text-sm text-muted">{t('needAutoNote')}</p>}

      <ul className="space-y-2.5">
        {items.map((item, index) => {
          const done = !!ticks[index];

          // Required documents: read-only status, not a button.
          if (isNeed) {
            return (
              <li key={index} className="flex items-start gap-3 p-2">
                <span
                  className={cn(
                    'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2',
                    done ? 'border-leaf-600 bg-leaf-600 text-white' : 'border-navy-200 bg-white',
                  )}
                >
                  {done && <Icon name="check" className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className="flex-1 text-base leading-relaxed">
                  {tr(item)}
                  <span
                    className={cn(
                      'ml-2 text-sm font-semibold',
                      done ? 'text-leaf-700' : 'text-muted',
                    )}
                  >
                    · {done ? t('sumProvided') : t('sumNeeded')}
                  </span>
                </span>
              </li>
            );
          }

          // Action steps: hand-ticked.
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => toggle.mutate({ documentId: doc.id, kind, index, done: !done })}
                className="flex w-full items-start gap-3 rounded-2xl p-2 text-left active:bg-navy-50"
              >
                <span
                  className={cn(
                    'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition',
                    done ? 'border-leaf-600 bg-leaf-600 text-white' : 'border-navy-200 bg-white',
                  )}
                >
                  {done && <Icon name="check" className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className={cn('text-base leading-relaxed', done && 'text-muted line-through')}>
                  {tr(item)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 space-y-2">
        <Progress value={doneCount} total={items.length} />
        <p className="text-sm text-muted">
          {doneCount} {t('of')} {items.length}{' '}
          {isNeed ? t('needProvidedLabel') : t('stepsDone')}
        </p>
      </div>

      {/* Submit the required documents directly from here. */}
      {isNeed && (
        <Button
          full
          size="md"
          className="mt-4"
          onClick={() => {
            setDirection('push');
            router.push(`/documents/${doc.id}/plan`);
          }}
        >
          <Icon name="tasks" className="h-5 w-5" />
          {t('goActions')}
        </Button>
      )}
    </SectionCard>
  );
}
