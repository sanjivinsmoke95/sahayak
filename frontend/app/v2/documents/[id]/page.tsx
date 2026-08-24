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
import { CATS } from '@/lib/i18n';
import { useUiStore, useWorkspaceStore } from '@/store';
import { daysUntil, formatDate, isValidIsoDate } from '@/utils/format';

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
  const [showAllPersonal, setShowAllPersonal] = useState(false);

  useEffect(() => {
    setActiveDocumentId(id);
    return () => setActiveDocumentId(null);
  }, [id, setActiveDocumentId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-[16px]" />
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
  const validityTone = validity?.status === 'valid' ? 'good'
    : validity?.status === 'expiring' ? 'warn'
    : validity?.status === 'expired' ? 'danger' : 'grey';

  const personal = document.personal ?? [];
  const visiblePersonal = showAllPersonal ? personal : personal.slice(0, 4);

  return (
    <div className="space-y-4 pb-4">
      {/* Header card */}
      <V2Card className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="v2-heading text-xl font-bold text-[#19120E]">{tr(document.title)}</h1>
              {validityLabel && <V2Badge tone={validityTone as any}>{validityLabel}</V2Badge>}
            </div>
            {daysLeft !== null && daysLeft >= 0 && daysLeft <= 90 && (
              <p className="mt-1 text-sm font-semibold text-[#0C6E6B]">
                Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
              </p>
            )}
          </div>
        </div>

        {/* Dates row */}
        <div className="mt-4 grid grid-cols-2 gap-4 rounded-[12px] bg-[#F6F3EF] p-3">
          {deadline && (
            <div>
              <p className="text-xs text-[#7A6E68]">Valid until</p>
              <p className="text-sm font-bold text-[#19120E]">{formatDate(deadline, language)}</p>
            </div>
          )}
          {document.received && (
            <div>
              <p className="text-xs text-[#7A6E68]">Issued on</p>
              <p className="text-sm font-bold text-[#19120E]">{formatDate(document.received, language)}</p>
            </div>
          )}
        </div>

        {/* Issuer */}
        {tr(document.issuer) && (
          <div className="mt-3">
            <p className="text-xs text-[#7A6E68]">Issued by</p>
            <p className="text-sm font-semibold text-[#19120E]">{tr(document.issuer)}</p>
          </div>
        )}
      </V2Card>

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

      {/* Extracted information */}
      {personal.length > 0 && (
        <V2Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="v2-heading text-base font-semibold text-[#19120E]">{t('personalTitle')}</h2>
            {personal.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllPersonal(!showAllPersonal)}
                className="text-sm font-semibold text-[#0C6E6B]"
              >
                {showAllPersonal ? 'Show less' : t('viewAll')}
              </button>
            )}
          </div>
          <div className="mt-3 space-y-2">
            {visiblePersonal.map((field, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-sm text-[#7A6E68]">{tr(field.label)}</span>
                <span className="text-sm font-semibold text-[#19120E]">
                  {field.sensitive ? '••••••' : field.value}
                </span>
              </div>
            ))}
          </div>
        </V2Card>
      )}

      {/* What can I do with this? CTA card */}
      <div className="rounded-[20px] bg-[#E1F0EF] p-4">
        <h2 className="v2-heading text-base font-bold text-[#19120E]">{t('secWhat')}</h2>
        <p className="mt-1 text-sm text-[#19120E]">{tr(document.what)}</p>
        <button
          type="button"
          onClick={() => { setDirection('push'); router.push('/v2/schemes'); }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#0C6E6B] px-4 py-3 text-sm font-bold text-white active:bg-[#0A5C5A]"
        >
          Find matching schemes
          <Icon name="right" className="h-4 w-4" />
        </button>
      </div>

      {/* Action rows */}
      <V2Card className="divide-y divide-[#EDE9E3]">
        <button
          type="button"
          onClick={() => { setDirection('push'); router.push('/v2/assistant'); }}
          className="flex w-full items-center gap-3 p-4 text-left active:bg-[#F6F3EF]"
        >
          <Icon name="chat" className="h-5 w-5 text-[#0C6E6B]" />
          <span className="flex-1 text-sm font-semibold text-[#19120E]">{t('askAbout')}</span>
          <Icon name="right" className="h-5 w-5 text-[#D8D0C7]" />
        </button>
        {document.original && (
          <button
            type="button"
            onClick={() => {/* toggle original view */}}
            className="flex w-full items-center gap-3 p-4 text-left active:bg-[#F6F3EF]"
          >
            <Icon name="doc" className="h-5 w-5 text-[#0C6E6B]" />
            <span className="flex-1 text-sm font-semibold text-[#19120E]">{t('originalDoc')}</span>
            <Icon name="right" className="h-5 w-5 text-[#D8D0C7]" />
          </button>
        )}
      </V2Card>

      {/* Steps / what to do */}
      {document.steps.length > 0 && (
        <V2Card className="p-4">
          <h2 className="v2-heading text-base font-semibold text-[#19120E]">{t('secDo')}</h2>
          <ul className="mt-3 space-y-2">
            {document.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E1F0EF] text-xs font-bold text-[#0C6E6B]">
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

      {/* View original document */}
      {document.original && (
        <V2ExpandableSection title={t('originalDoc')} icon="doc">
          <div className="rounded-[8px] bg-[#F6F3EF] p-3 text-sm leading-relaxed text-[#19120E]">
            {document.original}
          </div>
        </V2ExpandableSection>
      )}

      {/* Document tips */}
      <div className="flex items-start gap-3 rounded-[16px] border border-[#D8D0C7] bg-white p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#E1F0EF] text-[#0C6E6B]">
          <Icon name="info" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-[#19120E]">Document tips</p>
          <p className="mt-0.5 text-xs text-[#7A6E68]">
            Keep your documents updated to unlock more benefits.
          </p>
        </div>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={() => setDeleteOpen(true)}
        className="mx-auto mt-2 flex items-center gap-2 rounded-[12px] px-3 py-2 text-sm font-semibold text-[#C0392B] active:bg-[#FDEEEC]"
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
