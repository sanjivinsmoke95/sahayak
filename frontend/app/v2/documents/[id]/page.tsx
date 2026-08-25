'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Sheet, Skeleton } from '@/components/ui';
import { V2Button, V2Ribbon } from '@/components/v2';
import {
  useDeleteDocument, useDocument, useTranslation,
} from '@/hooks';
import { useUiStore, useWorkspaceStore } from '@/store';
import type { LanguageCode } from '@/types';
import { formatDate, isValidIsoDate } from '@/utils/format';

const NAVY = '#173A78';

export default function V2DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const id = params.id;

  const { data: document, isLoading, isError } = useDocument(id);
  const remove = useDeleteDocument();
  const setDirection = useUiStore((s) => s.setDirection);
  const setActiveDocumentId = useWorkspaceStore((s) => s.setActiveDocumentId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [originalOpen, setOriginalOpen] = useState(false);

  useEffect(() => {
    setActiveDocumentId(id);
    return () => setActiveDocumentId(null);
  }, [id, setActiveDocumentId]);

  const goBack = () => { setDirection('pop'); router.back(); };
  const share = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Sahayak', url: window.location.href }).catch(() => {});
    }
  };

  const title = document ? (document.docType || tr(document.title)) : '';

  return (
    <div className="min-h-full">
      {/* Header */}
      <header
        className="relative overflow-hidden border-b border-[#EAF1FF] bg-white"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}
      >
        <V2Ribbon placement="top" />
        <div className="relative flex items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={goBack}
            aria-label={t('back')}
            className="-ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#173A78] active:bg-[#EAF1FF]"
          >
            <Icon name="left" className="h-6 w-6" strokeWidth={2.4} />
          </button>
          <p className="v2-heading min-w-0 flex-1 truncate px-1 text-lg font-bold text-[#173A78]">
            {title || 'Document'}
          </p>
          <button
            type="button"
            onClick={share}
            aria-label="Options"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#173A78] active:bg-[#EAF1FF]"
          >
            <Icon name="moreV" className="h-5 w-5" />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4 px-4 pt-4">
          <Skeleton className="h-24 w-full rounded-[18px]" />
          <Skeleton className="h-40 w-full rounded-[18px]" />
        </div>
      ) : isError || !document ? (
        <p className="mx-4 mt-4 rounded-[16px] bg-[#FDE8EA] p-5 text-lg text-[#E5484D]">{t('notFound')}</p>
      ) : (
        <DetailBody
          document={document}
          language={language}
          tr={tr}
          onSchemes={() => { setDirection('push'); router.push('/v2/schemes'); }}
          onAsk={() => { setDirection('push'); router.push('/v2/assistant'); }}
          originalOpen={originalOpen}
          setOriginalOpen={setOriginalOpen}
          onDelete={() => setDeleteOpen(true)}
        />
      )}

      {document && (
        <Sheet open={deleteOpen} onOpenChange={setDeleteOpen} title={t('removeDoc')} closeLabel={t('cancel')}>
          <p className="rounded-[12px] bg-[#FDE8EA] p-4 text-sm leading-relaxed text-[#E5484D]">
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
      )}
    </div>
  );
}

function DetailBody({
  document, language, tr, onSchemes, onAsk, originalOpen, setOriginalOpen, onDelete,
}: {
  document: any;
  language: LanguageCode;
  tr: (v: any) => string;
  onSchemes: () => void;
  onAsk: () => void;
  originalOpen: boolean;
  setOriginalOpen: (v: boolean) => void;
  onDelete: () => void;
}) {
  const deadline = isValidIsoDate(document.deadline) ? document.deadline : null;
  const issuer = tr(document.issuer);
  const what = tr(document.what);
  const personal = document.personal ?? [];

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      {/* Status pill */}
      <span className="inline-flex items-center rounded-full bg-[#EAF7F0] px-3 py-1 text-xs font-bold text-[#2FA66A]">
        Explained
      </span>

      {/* Summary card */}
      <div className="rounded-[20px] border border-[#EAF1FF] bg-white p-4 shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-[#EAF1FF] text-[#173A78]">
            <Icon name="doc" className="h-6 w-6" />
          </span>
          <div className="grid flex-1 grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-[#6B7890]">Issued on</p>
              <p className="text-sm font-bold text-[#101828]">
                {document.received ? formatDate(document.received, language)
                  : deadline ? formatDate(deadline, language) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6B7890]">Issued by</p>
              <p className="text-sm font-semibold leading-snug text-[#101828]">
                {issuer || 'The issuing authority is printed on the certificate.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Your details */}
      {personal.length > 0 && (
        <div className="rounded-[20px] border border-[#EAF1FF] bg-white p-4 shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
          <h2 className="v2-heading text-base font-bold text-[#101828]">Your details</h2>
          <dl className="mt-3 space-y-3">
            {personal.map((field: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <dt className="text-sm text-[#6B7890]">{tr(field.label)}</dt>
                <dd className="text-right text-sm font-bold tabular-nums text-[#101828]">
                  {field.sensitive ? '•••••' : field.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* What is this document? */}
      {what && (
        <div className="rounded-[20px] bg-[#EAF1FF] p-4">
          <h2 className="v2-heading text-base font-bold text-[#101828]">What is this document?</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#101828]">{what}</p>
          <button
            type="button"
            onClick={onSchemes}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3.5 text-sm font-bold text-white active:translate-y-px"
            style={{ backgroundColor: NAVY }}
          >
            Find matching schemes
            <Icon name="right" className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Ask about this document */}
      <button
        type="button"
        onClick={onAsk}
        className="flex w-full items-center gap-3 rounded-[18px] border border-[#EAF1FF] bg-white p-4 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F5F8FF]"
      >
        <Icon name="chat" className="h-5 w-5 shrink-0 text-[#173A78]" />
        <span className="flex-1 text-[15px] font-semibold text-[#101828]">Ask about this document</span>
        <Icon name="right" className="h-5 w-5 shrink-0 text-[#C6D0E4]" />
      </button>

      {/* See the original document */}
      {document.original && (
        <div className="overflow-hidden rounded-[18px] border border-[#EAF1FF] bg-white shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
          <button
            type="button"
            onClick={() => setOriginalOpen(!originalOpen)}
            aria-expanded={originalOpen}
            className="flex w-full items-center gap-3 p-4 text-left active:bg-[#F5F8FF]"
          >
            <Icon name="doc" className="h-5 w-5 shrink-0 text-[#173A78]" />
            <span className="flex-1 text-[15px] font-semibold text-[#101828]">See the original document</span>
            <Icon name="down" className={`h-5 w-5 shrink-0 text-[#6B7890] transition-transform ${originalOpen ? 'rotate-180' : ''}`} />
          </button>
          {originalOpen && (
            <div className="border-t border-[#EAF1FF] p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#101828]">
                {document.original}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-3 rounded-[18px] border border-[#FBD9DB] bg-[#FEF1F2] p-4 text-left active:bg-[#FDE8EA]"
      >
        <Icon name="trash" className="h-5 w-5 shrink-0 text-[#E5484D]" />
        <span className="flex-1 text-[15px] font-bold text-[#E5484D]">Delete this document</span>
      </button>
    </div>
  );
}
