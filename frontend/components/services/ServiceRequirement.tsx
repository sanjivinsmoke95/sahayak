'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import type { SlotResult } from '@/hooks/useServiceRequirementUpload';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import type { Localized, SahayakDocument } from '@/types';
import { fill } from '@/utils/format';

const ACCEPT = 'application/pdf,image/jpeg,image/jpg,image/png';

/**
 * One required-document slot. If a matching document is already in My Documents
 * it shows as provided (and reused). Otherwise it offers an upload that is
 * analysed, classified and matched — the slot fills itself only on a real match.
 */
export function ServiceRequirement({
  requirement,
  matched,
  onUpload,
}: {
  requirement: Localized;
  matched: SahayakDocument | null;
  onUpload: (file: File) => Promise<SlotResult>;
}) {
  const { t, tr } = useTranslation();
  const router = useRouter();
  const setDirection = useUiStore((s) => s.setDirection);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const pick = async (file?: File) => {
    if (!file) return;
    setFeedback(null);
    setPending(true);
    const res = await onUpload(file);
    setPending(false);
    if (res.kind === 'satisfied') setFeedback(t('svcSlotSatisfied'));
    else if (res.kind === 'valid-other')
      setFeedback(fill(t('svcSlotWrong'), { type: res.docType || t('chatDetectedDoc') }));
    else if (res.kind === 'unsure') setFeedback(t('chatUnsure'));
    else if (res.kind === 'not-gov')
      setFeedback(res.docType ? fill(t('chatNotGovGuess'), { type: res.docType }) : t('chatNotGov'));
    else setFeedback(t('chatUploadFail'));
  };

  const provided = !!matched;

  return (
    <li className="rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2',
            provided ? 'border-leaf-600 bg-leaf-600 text-white' : 'border-navy-200 bg-white',
          )}
        >
          {provided && <Icon name="check" className="h-4 w-4" strokeWidth={3} />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-snug">{tr(requirement)}</p>
          {provided ? (
            <p className="mt-0.5 text-sm font-medium text-leaf-700">
              {matched!.docType || t('sumProvided')} · {t('svcReuse')}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted">{t('svcMissing')}</p>
          )}
          {feedback && (
            <p className="mt-2 rounded-lg bg-navy-50 p-2 text-sm leading-relaxed text-ink">
              {feedback}
            </p>
          )}
        </div>

        {provided ? (
          <div className="flex shrink-0 flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => {
                setDirection('push');
                router.push(`/documents/${matched!.id}`);
              }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-600 active:bg-navy-50"
            >
              {t('svcView')}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
              className="rounded-lg px-3 py-1 text-sm font-semibold text-muted active:bg-navy-50 disabled:opacity-60"
            >
              {t('svcReplace')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-navy-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Icon name={pending ? 'spark' : 'upload'} className={cn('h-4 w-4', pending && 'animate-spin')} />
            {t('svcUpload')}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          void pick(e.target.files?.[0] ?? undefined);
          e.target.value = '';
        }}
      />
    </li>
  );
}
