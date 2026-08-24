'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Sheet, Skeleton } from '@/components/ui';
import { V2Badge, V2Button, V2Card, V2ExpandableSection, statusTone } from '@/components/v2';
import {
  useChecklists, useDeleteDocument, useDocument, useDocumentValidity,
  useTranslation, useConsistency,
} from '@/hooks';
import { useUiStore, useWorkspaceStore } from '@/store';
import { daysUntil, fill, formatDate, isValidIsoDate } from '@/utils/format';

export default function V2DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const id = params.id;

  const { data: document, isLoading, isError } = useDocument(id);
  const { data: checklists } = useChecklists();
  const { data: validity } = useDocumentValidity(id);
  const { data: consistency } = useConsistency();
  const remove = useDeleteDocument();
  const setDirection = useUiStore((s) => s.setDirection);
  const setActiveDocumentId = useWorkspaceStore((s) => s.setActiveDocumentId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setActiveDocumentId(id);
    return () => setActiveDocumentId(null);
  }, [id, setActiveDocumentId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-[16px]" />
        <Skeleton className="h-24 w-full rounded-[16px]" />
      </div>
    );
  }

  if (isError || !document) {
    return <p className="rounded-[16px] bg-[#FDEEEC] p-5 text-lg text-[#C0392B]">{t('notFound')}</p>;
  }

  const checklist = checklists?.[document.id];
  const deadline = isValidIsoDate(document.deadline) ? document.deadline : null;
  const daysLeft = deadline ? daysUntil(deadline) : null;
  const issues = consistency?.issues?.filter((i) => i.documents.includes(document.id)) ?? [];

  const validityLabel = validity?.status === 'valid' ? t('valid')
    : validity?.status === 'expiring' ? t('expiring')
    : validity?.status === 'expired' ? t('expired') : null;

  return (
    <div className="space-y-4 pb-4">
      {/* Identity card */}
      <div className="rounded-[20px] bg-[#0C6E6B] p-5 text-white shadow-[0_4px_20px_rgba(25,18,14,0.10)]">
        <p className="text-sm font-medium text-white/60">{document.docType || tr(document.issuer)}</p>
        <h1 className="v2-heading mt-1 text-xl font-bold">{tr(document.title)}</h1>
        {document.refNo && (
          <p className="mt-1 font-mono text-sm text-white/50">{document.refNo}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {validityLabel && (
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
              {validityLabel}
            </span>
          )}
          {daysLeft !== null && daysLeft >= 0 && daysLeft <= 90 && (
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
              {daysLeft} {daysLeft === 1 ? t('dayLeft') : t('daysLeft')}
            </span>
          )}
          {deadline && (
            <span className="text-xs text-white/50">
              {t('secDeadline')}: {formatDate(deadline, language)}
            </span>
          )}
        </div>
      </div>

      {/* Consistency warnings */}
      {issues.length > 0 && (
        <div className="rounded-[16px] border border-[#C97B1A]/20 bg-[#FDF3E1] p-4">
          <p className="text-sm font-bold text-[#C97B1A]">{t('consistencyTitle')}</p>
          {issues.map((issue, i) => (
            <p key={i} className="mt-1 text-sm text-[#19120E]">
              {issue.field}: {issue.values.join(' / ')}
            </p>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setDirection('push'); router.push('/v2/assistant'); }}
          className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#E1F0EF] px-3 py-3 text-sm font-semibold text-[#0C6E6B] active:bg-[#D8D0C7]"
        >
          <Icon name="chat" className="h-4 w-4" />
          {t('shortAsk')}
        </button>
        <button
          type="button"
          onClick={() => { setDirection('push'); router.push('/v2/schemes'); }}
          className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#E1F0EF] px-3 py-3 text-sm font-semibold text-[#0C6E6B] active:bg-[#D8D0C7]"
        >
          <Icon name="globe" className="h-4 w-4" />
          {t('tabSchemes')}
        </button>
      </div>

      {/* What is this document? */}
      <V2Card className="p-4">
        <h2 className="v2-heading text-base font-semibold text-[#19120E]">{t('secWhat')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#19120E]">{tr(document.what)}</p>
      </V2Card>

      {/* Why did you receive it? */}
      {tr(document.why) && (
        <V2Card className="p-4">
          <h2 className="v2-heading text-base font-semibold text-[#19120E]">{t('secWhy')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#19120E]">{tr(document.why)}</p>
        </V2Card>
      )}

      {/* Steps / what to do */}
      {document.steps.length > 0 && (
        <V2Card className="p-4">
          <h2 className="v2-heading text-base font-semibold text-[#19120E]">{t('secDo')}</h2>
          <ul className="mt-3 space-y-2">
            {document.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#E1F0EF] text-[#0C6E6B] text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-[#19120E]">{tr(step)}</span>
              </li>
            ))}
          </ul>
        </V2Card>
      )}

      {/* Documents needed */}
      {document.need.length > 0 && (
        <V2Card className="p-4">
          <h2 className="v2-heading text-base font-semibold text-[#19120E]">{t('secNeed')}</h2>
          <ul className="mt-3 space-y-2">
            {document.need.map((item, i) => {
              const done = checklist?.need[i];
              return (
                <li key={i} className="flex items-center gap-2.5">
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${done ? 'bg-[#ECF7F1] text-[#2D7A4F]' : 'bg-[#EDE9E3] text-[#7A6E68]'}`}>
                    <Icon name={done ? 'check' : 'help'} className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-[#19120E]">{tr(item)}</span>
                </li>
              );
            })}
          </ul>
        </V2Card>
      )}

      {/* Progressive disclosure sections */}
      <V2ExpandableSection title={t('moreExtracted')} icon="info">
        {document.personal && document.personal.length > 0 && (
          <div className="space-y-2">
            {document.personal.map((field, i) => (
              <div key={i} className="flex items-center justify-between rounded-[8px] bg-[#F6F3EF] px-3 py-2">
                <span className="text-sm text-[#7A6E68]">{tr(field.label)}</span>
                <span className="text-sm font-semibold text-[#19120E]">
                  {field.sensitive ? '••••••' : field.value}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <h3 className="text-sm font-semibold text-[#7A6E68]">{t('showSimple')}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#19120E]">{tr(document.explain)}</p>
        </div>
      </V2ExpandableSection>

      <V2ExpandableSection title={t('moreVerify')} icon="lock">
        {document.pairs.length > 0 && (
          <div className="space-y-2">
            {document.pairs.map((pair, i) => (
              <div key={i} className="rounded-[8px] bg-[#F6F3EF] px-3 py-2">
                <p className="text-xs font-medium text-[#7A6E68]">{pair.gov}</p>
                <p className="mt-0.5 text-sm text-[#19120E]">{tr(pair.simple)}</p>
              </div>
            ))}
          </div>
        )}
      </V2ExpandableSection>

      <V2ExpandableSection title={t('moreOriginal')} icon="doc">
        {document.original && (
          <div className="notice-paper rounded-[8px] p-3 text-sm leading-relaxed text-[#19120E]">
            {document.original}
          </div>
        )}
      </V2ExpandableSection>

      {/* Where to submit */}
      {tr(document.where) && (
        <V2Card className="p-4">
          <h2 className="v2-heading text-base font-semibold text-[#19120E]">{t('secWhere')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#19120E]">{tr(document.where)}</p>
        </V2Card>
      )}

      {/* Delete */}
      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="mx-auto mt-2 flex items-center gap-2 rounded-[12px] px-3 py-2 text-base font-semibold text-[#C0392B] active:bg-[#FDEEEC]"
      >
        <Icon name="trash" className="h-5 w-5" />
        {t('removeDoc')}
      </button>

      <Sheet open={deleteOpen} onOpenChange={setDeleteOpen} title={t('removeDoc')} closeLabel={t('cancel')}>
        <p className="rounded-[12px] bg-[#FDEEEC] p-4 text-sm leading-relaxed text-[#C0392B]">
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
