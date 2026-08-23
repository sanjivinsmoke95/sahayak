'use client';

import { useRouter } from 'next/navigation';
import { Card, Progress } from '@/components/ui';
import { DeadlineChip, Icon } from '@/components/common';
import { useToggleChecklistItem, useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import type { Checklist, SahayakDocument } from '@/types';

interface ActionGroupProps {
  document: SahayakDocument;
  checklist: Checklist | undefined;
}

/** One document's outstanding steps, gathered onto the actions screen. */
export function ActionGroup({ document: doc, checklist }: ActionGroupProps) {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const toggle = useToggleChecklistItem();
  const setDirection = useUiStore((s) => s.setDirection);

  const ticks = checklist?.steps ?? {};
  const doneCount = doc.steps.filter((_, i) => ticks[i]).length;
  const complete = doneCount === doc.steps.length;

  return (
    <Card className="p-5">
      <button
        type="button"
        onClick={() => {
          setDirection('push');
          router.push(`/documents/${doc.id}`);
        }}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <h2 className="text-lg font-bold leading-snug">{tr(doc.title)}</h2>
        <Icon name="right" className="mt-1 h-5 w-5 shrink-0 text-navy-300" />
      </button>

      <div className="mt-2">
        <DeadlineChip iso={doc.deadline} />
      </div>

      <ul className="mt-4 space-y-2">
        {doc.steps.map((step, index) => {
          const done = !!ticks[index];
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => toggle.mutate({ documentId: doc.id, kind: 'steps', index, done: !done })}
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
                  {tr(step)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 space-y-2">
        <Progress value={doneCount} total={doc.steps.length} />
        <p className="text-sm text-muted">
          {complete ? t('allDone') : `${doneCount} ${t('of')} ${doc.steps.length} ${t('stepsDone')}`}
        </p>
      </div>
    </Card>
  );
}
