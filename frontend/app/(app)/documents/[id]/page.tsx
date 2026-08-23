'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExpandableSection, Icon } from '@/components/common';
import { Skeleton } from '@/components/ui';
import {
  BelongsTo,
  CompareDocuments,
  DocumentQuickActions,
  DocumentSummaryCard,
  EligibilityChecker,
  ExplanationSections,
  FormAssistant,
  JargonPairs,
  OriginalFile,
  OriginalWording,
  PersonalDetails,
  RejectionExplainer,
  RelevantServices,
  StepChecklist,
  VerificationSignals,
} from '@/components/document';
import { useChecklists, useDeleteDocument, useDocument, useTranslation } from '@/hooks';
import { useUiStore, useWorkspaceStore } from '@/store';

/**
 * One document, explained — the mockup layout: a compact identity card and the
 * next actions up top, then progressive disclosure for everything else. Every
 * intelligence feature is preserved; the urgent ones (rejection, mismatch,
 * form) surface themselves, the rest live under "More information".
 */
export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id;

  const { data: document, isLoading, isError } = useDocument(id);
  const { data: checklists } = useChecklists();
  const remove = useDeleteDocument();
  const setDirection = useUiStore((s) => s.setDirection);
  const setActiveDocumentId = useWorkspaceStore((s) => s.setActiveDocumentId);

  // So the assistant knows what "this document" means.
  useEffect(() => {
    setActiveDocumentId(id);
    return () => setActiveDocumentId(null);
  }, [id, setActiveDocumentId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (isError || !document) {
    return <p className="rounded-xl2 bg-alert-50 p-5 text-lg text-alert-600">{t('notFound')}</p>;
  }

  const checklist = checklists?.[document.id];

  return (
    <div className="space-y-5 pb-4">
      {/* Identity + status. */}
      <DocumentSummaryCard document={document} />

      {/* Urgent, contextual — these self-hide when not applicable. */}
      <RejectionExplainer document={document} />
      <FormAssistant document={document} />
      <BelongsTo document={document} />

      {/* Primary next actions. */}
      <DocumentQuickActions document={document} />

      {/* Optional, user-triggered document comparison. */}
      <CompareDocuments document={document} />

      {/* Documents you need — kept prominent, with its direct submit path. */}
      <StepChecklist document={document} checklist={checklist} kind="need" />

      {/* More information — progressive disclosure. */}
      <ExpandableSection title={t('moreExtracted')} icon="info">
        <PersonalDetails document={document} />
        <ExplanationSections document={document} />
      </ExpandableSection>

      <ExpandableSection title={t('moreDocsServices')} icon="tasks">
        <RelevantServices document={document} />
        <StepChecklist document={document} checklist={checklist} kind="steps" />
        <EligibilityChecker document={document} />
      </ExpandableSection>

      <ExpandableSection title={t('moreVerify')} icon="lock">
        <VerificationSignals document={document} />
        <JargonPairs document={document} />
      </ExpandableSection>

      <ExpandableSection title={t('moreOriginal')} icon="doc">
        <OriginalFile document={document} />
        <OriginalWording document={document} />
      </ExpandableSection>

      {/* Quiet, out of the way — deleting is rare and not undoable. */}
      <button
        type="button"
        onClick={() => {
          if (!window.confirm(t('removeAsk'))) return;
          remove.mutate(document.id, {
            onSuccess: () => {
              setDirection('pop');
              router.push('/documents');
            },
          });
        }}
        disabled={remove.isPending}
        className="mx-auto mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-base font-semibold text-alert-600 active:bg-alert-50 disabled:opacity-50"
      >
        <Icon name="trash" className="h-5 w-5" />
        {t('removeDoc')}
      </button>
    </div>
  );
}
