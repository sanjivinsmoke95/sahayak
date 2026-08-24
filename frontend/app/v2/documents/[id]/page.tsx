'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Sheet, Skeleton } from '@/components/ui';
import { V2Button } from '@/components/v2';
import {
  useDeleteDocument, useDocument, useDocumentValidity, useSpeech, useTranslation,
} from '@/hooks';
import { useUiStore, useWorkspaceStore } from '@/store';
import { formatDate, isValidIsoDate } from '@/utils/format';

type Tone = 'blue' | 'purple' | 'green' | 'orange';

const TONE: Record<Tone, { card: string; icon: string; title: string }> = {
  blue: { card: 'bg-[#EAF1FF]', icon: 'text-[#102D63]', title: 'text-[#102D63]' },
  purple: { card: 'bg-[#F1ECFB]', icon: 'text-[#6B4EE6]', title: 'text-[#6B4EE6]' },
  green: { card: 'bg-[#EAF7EF]', icon: 'text-[#2E9B67]', title: 'text-[#2E9B67]' },
  orange: { card: 'bg-[#FFF3E3]', icon: 'text-[#F4A340]', title: 'text-[#B5760F]' },
};

/** One pastel explanation card. Optional onOpen adds a › affordance. */
function QACard({
  tone, icon, title, children, onOpen,
}: {
  tone: Tone; icon: string; title: string; children: React.ReactNode; onOpen?: () => void;
}) {
  const s = TONE[tone];
  const Tag = onOpen ? 'button' : 'div';
  return (
    <Tag
      {...(onOpen ? { type: 'button' as const, onClick: onOpen } : {})}
      className={`flex w-full items-start gap-3 rounded-[18px] ${s.card} p-4 text-left`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white/70 ${s.icon}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] font-bold ${s.title}`}>{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-[#101828]">{children}</span>
      </span>
      {onOpen && <Icon name="right" className="mt-1 h-5 w-5 shrink-0 text-[#667085]" />}
    </Tag>
  );
}

export default function V2DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const id = params.id;

  const { data: document, isLoading, isError } = useDocument(id);
  const { data: validity } = useDocumentValidity(id);
  const remove = useDeleteDocument();
  const speech = useSpeech();
  const setDirection = useUiStore((s) => s.setDirection);
  const setActiveDocumentId = useWorkspaceStore((s) => s.setActiveDocumentId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [originalOpen, setOriginalOpen] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setActiveDocumentId(id);
    return () => setActiveDocumentId(null);
  }, [id, setActiveDocumentId]);

  // Stop any narration when leaving the screen.
  useEffect(() => () => speech.stop(), [speech]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-[18px]" />
        <Skeleton className="h-24 w-full rounded-[18px]" />
        <Skeleton className="h-24 w-full rounded-[18px]" />
      </div>
    );
  }

  if (isError || !document) {
    return <p className="rounded-[16px] bg-[#FDE8EA] p-5 text-lg text-[#DC3545]">{t('notFound')}</p>;
  }

  const deadline = isValidIsoDate(document.deadline) ? document.deadline : null;
  const issuer = tr(document.issuer);
  const what = tr(document.what);
  const why = tr(document.why);
  const steps = document.steps.map((s) => tr(s)).filter(Boolean);
  const personal = document.personal ?? [];
  const title = document.docType || tr(document.title);

  const listenText = [what, why, steps.join('. '), tr(document.explain)]
    .filter(Boolean)
    .join('. ');
  const speaking = speech.state === 'speaking';
  const askMore = () => { setDirection('push'); router.push('/v2/assistant'); };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Summary card */}
      <div className="rounded-[22px] border border-[#E8EDF5] bg-white p-4 shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
        <div className="flex items-start justify-between gap-2">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#EAF7EF] text-[#2E9B67]">
            <Icon name="doc" className="h-6 w-6" />
          </span>
          <span className="rounded-full bg-[#EAF7EF] px-3 py-1 text-xs font-bold text-[#2E9B67]">
            Completed
          </span>
        </div>
        <h1 className="v2-heading mt-3 text-xl font-extrabold text-[#101828]">{title}</h1>
        {issuer && (
          <div className="mt-2">
            <p className="text-xs text-[#667085]">Issued by</p>
            <p className="text-[15px] font-bold text-[#101828]">{issuer}</p>
          </div>
        )}
        {(document.received || deadline) && (
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#EAF1FF] pt-3">
            <div>
              <p className="text-xs text-[#667085]">Issued on</p>
              <p className="text-[15px] font-bold text-[#101828]">
                {document.received ? formatDate(document.received, language) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#667085]">Valid until</p>
              <p className="text-[15px] font-bold text-[#101828]">
                {deadline ? formatDate(deadline, language) : '—'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Q&A explanation cards */}
      {what && (
        <QACard tone="blue" icon="doc" title="What is this?" onOpen={askMore}>
          {what}
        </QACard>
      )}
      {why && (
        <QACard tone="purple" icon="help" title="Why did I receive this?" onOpen={askMore}>
          {why}
        </QACard>
      )}
      {steps.length > 0 && (
        <QACard tone="green" icon="tasks" title="What should I do?" onOpen={askMore}>
          <ol className="space-y-1.5">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-[#2E9B67]">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </QACard>
      )}
      <QACard tone="orange" icon="calendar" title="By when?">
        {deadline
          ? `Submit or renew by ${formatDate(deadline, language)}.`
          : 'There is no deadline printed on this document.'}
      </QACard>

      {/* Listen + Ask */}
      <button
        type="button"
        disabled={!speech.supported || !listenText}
        onClick={() => (speaking ? speech.stop() : speech.speak(listenText))}
        className="flex w-full items-center justify-center gap-2.5 rounded-[16px] bg-[#102D63] px-4 py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(16,40,99,0.22)] transition active:translate-y-px disabled:opacity-50"
      >
        <Icon name={speaking ? 'close' : 'play'} className="h-5 w-5" />
        {speaking ? 'Stop' : 'Listen to explanation'}
      </button>
      <button
        type="button"
        onClick={() => { setDirection('push'); router.push('/v2/assistant'); }}
        className="flex w-full items-center justify-center gap-2.5 rounded-[16px] border border-[#D9E2F0] bg-white px-4 py-4 text-base font-bold text-[#102D63] active:bg-[#F8FAFC]"
      >
        <Icon name="chat" className="h-5 w-5" />
        Ask another question
      </button>

      {/* Extracted information — clean, separate from the original */}
      {personal.length > 0 && (
        <section className="rounded-[22px] border border-[#E8EDF5] bg-white p-4 shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
          <h2 className="v2-heading text-base font-bold text-[#101828]">Extracted information</h2>
          <dl className="mt-3 divide-y divide-[#EAF1FF]">
            {personal.map((field, i) => {
              const show = revealed[i];
              return (
                <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <dt className="text-sm text-[#667085]">{tr(field.label)}</dt>
                  <dd className="flex items-center gap-2 text-sm font-bold text-[#101828]">
                    <span className="tabular-nums">
                      {field.sensitive && !show ? '••••••' : field.value}
                    </span>
                    {field.sensitive && (
                      <button
                        type="button"
                        onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))}
                        className="text-xs font-semibold text-[#102D63]"
                      >
                        {show ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      )}

      {/* Original document — the raw notice only */}
      {document.original && (
        <section className="overflow-hidden rounded-[22px] border border-[#E8EDF5] bg-white shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
          <button
            type="button"
            onClick={() => setOriginalOpen((v) => !v)}
            aria-expanded={originalOpen}
            className="flex w-full items-center gap-3 p-4 text-left active:bg-[#F8FAFC]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#EAF1FF] text-[#102D63]">
              <Icon name="doc" className="h-5 w-5" />
            </span>
            <span className="flex-1 text-[15px] font-bold text-[#101828]">See the original document</span>
            <Icon name="down" className={`h-5 w-5 text-[#667085] transition-transform ${originalOpen ? 'rotate-180' : ''}`} />
          </button>
          {originalOpen && (
            <div className="border-t border-[#EAF1FF] p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#101828]">
                {document.original}
              </pre>
            </div>
          )}
        </section>
      )}

      {/* Connect to a nearby Mee Seva centre */}
      <button
        type="button"
        onClick={() => { setDirection('push'); router.push('/v2/mee-seva'); }}
        className="flex w-full items-center gap-3 rounded-[18px] border border-[#E8EDF5] bg-white p-4 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F8FAFC]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#FFF3E3] text-[#F4A340]">
          <Icon name="scan" className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-bold text-[#101828]">Visit a nearby Mee Seva centre</span>
          <span className="mt-0.5 block text-xs text-[#667085]">Find the closest centre to submit this in person</span>
        </span>
        <Icon name="right" className="h-5 w-5 shrink-0 text-[#D6DDE8]" />
      </button>

      {/* Delete */}
      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="mx-auto mt-1 flex items-center gap-2 rounded-[12px] px-3 py-2 text-sm font-semibold text-[#DC3545] active:bg-[#FDE8EA]"
      >
        <Icon name="trash" className="h-5 w-5" />
        Delete this document
      </button>

      <Sheet open={deleteOpen} onOpenChange={setDeleteOpen} title={t('removeDoc')} closeLabel={t('cancel')}>
        <p className="rounded-[12px] bg-[#FDE8EA] p-4 text-sm leading-relaxed text-[#DC3545]">
          {t('removeAsk')}
        </p>
        <div className="mt-4 space-y-2">
          <V2Button
            full
            variant="danger"
            disabled={remove.isPending}
            onClick={() => {
              remove.mutate(document.id, {
                onSuccess: () => { setDeleteOpen(false); setDirection('pop'); router.push('/v2/documents'); },
              });
            }}
          >
            <Icon name="trash" className="h-5 w-5" />
            {t('removeDoc')}
          </V2Button>
          <V2Button full variant="secondary" onClick={() => setDeleteOpen(false)}>
            {t('cancel')}
          </V2Button>
        </div>
      </Sheet>
    </div>
  );
}
