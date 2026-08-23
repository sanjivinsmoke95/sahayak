'use client';

import { Button } from '@/components/ui';
import { DeadlineChip, Icon } from '@/components/common';
import { useTranslation } from '@/hooks';
import type { SahayakDocument } from '@/types';
import { formatDate, isValidIsoDate } from '@/utils/format';
import { ListenButton } from './ListenButton';

/**
 * The calm, spacious first view of an analysed document — the four questions a
 * worried person actually has, and nothing else. Reference numbers, issuer
 * lines and the raw notice are deliberately kept off this screen; they live
 * behind Continue. Built to be read by someone elderly and nervous.
 */
export function DocumentSummary({
  document: doc,
  onContinue,
}: {
  document: SahayakDocument;
  onContinue: () => void;
}) {
  const { t, tr, language } = useTranslation();

  // "Do" wording only when the notice actually asks for an action; an identity
  // card like a PAN shows "what to know" instead.
  const actionable = doc.status === 'action' || isValidIsoDate(doc.deadline);
  const knowOrDoLabel = actionable ? t('sumToDo') : t('sumToKnow');
  const knowOrDoBody = actionable ? tr(doc.steps[0]) || tr(doc.what) : tr(doc.what);

  const deadlineText = isValidIsoDate(doc.deadline)
    ? formatDate(doc.deadline, language)
    : t('noDeadline');

  const needs = doc.need ?? [];
  const needDone = doc.needDone ?? [];

  // What the Listen control reads — the simplified summary, in this language.
  const spoken = [
    tr(doc.title),
    knowOrDoBody,
    `${t('sumLastDate')}: ${deadlineText}`,
    needs.length ? `${t('sumDocsReq')}: ${needs.map((n) => tr(n)).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <div className="space-y-5">
      {/* What is this document? */}
      <section className="rounded-xl2 border border-navy-100 bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted">{t('sumWhatIs')}</p>
        <h1 className="mt-1.5 text-2xl font-bold leading-snug">{tr(doc.title)}</h1>
      </section>

      {/* What do I need to know / do? */}
      {knowOrDoBody && (
        <section className="rounded-xl2 border border-navy-100 bg-navy-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-navy-600">
            {knowOrDoLabel}
          </p>
          <p className="mt-2 text-lg leading-relaxed">{knowOrDoBody}</p>
        </section>
      )}

      {/* Last date */}
      <section className="rounded-xl2 border border-navy-100 bg-white p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amberx-50 text-amberx-700">
            <Icon name="calendar" className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t('sumLastDate')}
            </p>
            <p className="mt-1 text-xl font-bold leading-snug">{deadlineText}</p>
            {isValidIsoDate(doc.deadline) && (
              <div className="mt-2">
                <DeadlineChip iso={doc.deadline} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Documents required — only when the notice lists any. */}
      {needs.length > 0 && (
        <section className="rounded-xl2 border border-navy-100 bg-white p-5 shadow-soft">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-leaf-50 text-leaf-700">
              <Icon name="doc" className="h-7 w-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t('sumDocsReq')}
              </p>
              <ul className="mt-3 space-y-2.5">
                {needs.map((item, index) => {
                  const provided = !!needDone[index];
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <span
                        className={
                          provided
                            ? 'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-600 text-white'
                            : 'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-navy-200'
                        }
                      >
                        {provided && <Icon name="check" className="h-4 w-4" strokeWidth={3} />}
                      </span>
                      <span className="text-base leading-relaxed">
                        {tr(item)}
                        <span className="ml-2 text-sm text-muted">
                          {provided ? `· ${t('sumProvided')}` : `· ${t('sumNeeded')}`}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Listen + Continue */}
      <div className="space-y-3 pt-1">
        <ListenButton text={spoken} />
        <Button full size="lg" onClick={onContinue}>
          <Icon name="right" className="h-5 w-5" />
          {t('sumContinue')}
        </Button>
      </div>
    </div>
  );
}
