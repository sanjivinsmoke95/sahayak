'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { Sheet, Skeleton } from '@/components/ui';
import { V2Button, V2Header } from '@/components/v2';
import {
  useAuthToken, useDeleteDocument, useDocument, useSpeech, useTranslation,
} from '@/hooks';
import { useUiStore, useWorkspaceStore } from '@/store';
import type { LanguageCode, Localized, SahayakDocument } from '@/types';
import { formatDate, isValidIsoDate } from '@/utils/format';

type Tr = (value: Localized) => string;

const NAVY = '#173A78';

type Tone = 'blue' | 'purple' | 'green' | 'orange';

const TONE: Record<Tone, { card: string; icon: string; title: string }> = {
  blue: { card: 'bg-[#EAF1FF]', icon: 'text-[#173A78]', title: 'text-[#173A78]' },
  purple: { card: 'bg-[#F1ECFB]', icon: 'text-[#6B4EE6]', title: 'text-[#6B4EE6]' },
  green: { card: 'bg-[#EAF7F0]', icon: 'text-[#2FA66A]', title: 'text-[#2FA66A]' },
  orange: { card: 'bg-[#FFF4E7]', icon: 'text-[#C77A1B]', title: 'text-[#C77A1B]' },
};

/** One pastel explanation card, with an optional speaker to hear just this part. */
function QACard({
  tone, icon, title, children, onListen,
}: {
  tone: Tone; icon: string; title: string; children: React.ReactNode; onListen?: () => void;
}) {
  const s = TONE[tone];
  return (
    <div className={`flex w-full items-start gap-3 rounded-[18px] ${s.card} p-4`}>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white/70 ${s.icon}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] font-bold ${s.title}`}>{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-[#101828]">{children}</span>
      </span>
      {onListen && (
        <button
          type="button"
          onClick={onListen}
          aria-label="Listen to this section"
          className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/70 ${s.icon} active:translate-y-px`}
        >
          <Icon name="speaker" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function V2DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const id = params.id;

  const { data: document, isLoading, isError } = useDocument(id);
  const remove = useDeleteDocument();
  const speech = useSpeech();
  const setDirection = useUiStore((s) => s.setDirection);
  const setLanguageSheetOpen = useUiStore((s) => s.setLanguageSheetOpen);
  const setActiveDocumentId = useWorkspaceStore((s) => s.setActiveDocumentId);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setActiveDocumentId(id);
    return () => setActiveDocumentId(null);
  }, [id, setActiveDocumentId]);

  useEffect(() => () => speech.stop(), [speech]);

  const share = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Sahayak', url: window.location.href }).catch(() => {});
    }
  };

  const title = document ? (document.docType || tr(document.title)) : '';
  const listenText = document
    ? [tr(document.what), tr(document.why),
       (document.steps ?? []).map((s) => tr(s)).join('. '), tr(document.explain)]
      .filter(Boolean).join('. ')
    : '';
  const speaking = speech.state === 'speaking';
  const nav = (path: string) => { setMenuOpen(false); setDirection('push'); router.push(path); };

  const menuItems: { icon: string; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }[] = [
    {
      icon: speaking ? 'close' : 'play',
      label: speaking ? 'Stop reading' : 'Listen to explanation',
      disabled: !speech.supported || !listenText,
      onClick: () => { setMenuOpen(false); if (speaking) speech.stop(); else speech.speak(listenText); },
    },
    { icon: 'search', label: 'Find matching schemes', onClick: () => nav('/v2/schemes') },
    { icon: 'tasks', label: 'Document plan', onClick: () => nav(`/v2/documents/${id}/plan`) },
    { icon: 'chat', label: 'Ask about this document', onClick: () => nav('/v2/assistant') },
    { icon: 'scan', label: 'Visit a nearby Mee Seva centre', onClick: () => nav('/v2/mee-seva') },
    { icon: 'share', label: 'Share', onClick: () => { setMenuOpen(false); share(); } },
    { icon: 'trash', label: 'Delete this document', danger: true, onClick: () => { setMenuOpen(false); setDeleteOpen(true); } },
  ];

  return (
    <div className="min-h-full">
      {/* Shared header — identical logo + flag + spacing on every screen */}
      <V2Header>
        <button
          type="button"
          onClick={() => setLanguageSheetOpen(true)}
          aria-label={t('language')}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#173A78] active:bg-[#EAF1FF]"
        >
          <Icon name="globe" className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Options"
          aria-haspopup="menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#173A78] active:bg-[#EAF1FF]"
        >
          <Icon name="moreV" className="h-5 w-5" />
        </button>
      </V2Header>

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
          slug={id}
          language={language}
          tr={tr}
          speech={speech}
          onSchemes={() => { setDirection('push'); router.push('/v2/schemes'); }}
          onAsk={() => { setDirection('push'); router.push('/v2/assistant'); }}
          onMeeSeva={() => { setDirection('push'); router.push('/v2/mee-seva'); }}
          onDelete={() => setDeleteOpen(true)}
        />
      )}

      {document && (
        <Sheet open={menuOpen} onOpenChange={setMenuOpen} title={title || 'Options'} closeLabel={t('close')}>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={item.disabled}
                onClick={item.onClick}
                className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-3.5 text-left text-[15px] font-semibold transition disabled:opacity-40 ${
                  item.danger ? 'text-[#E5484D] active:bg-[#FDE8EA]' : 'text-[#101828] active:bg-[#F5F8FF]'
                }`}
              >
                <Icon
                  name={item.icon}
                  className={`h-5 w-5 shrink-0 ${item.danger ? 'text-[#E5484D]' : 'text-[#173A78]'}`}
                />
                {item.label}
              </button>
            ))}
          </div>
        </Sheet>
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
  document, slug, language, tr, speech, onSchemes, onAsk, onMeeSeva, onDelete,
}: {
  document: SahayakDocument;
  slug: string;
  language: LanguageCode;
  tr: Tr;
  speech: ReturnType<typeof useSpeech>;
  onSchemes: () => void;
  onAsk: () => void;
  onMeeSeva: () => void;
  onDelete: () => void;
}) {
  const getToken = useAuthToken();
  const [originalOpen, setOriginalOpen] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState(false);

  const isImage = (document.originalFile?.mime ?? '').startsWith('image/');

  // Fetch the user's uploaded file (authenticated) as a blob URL once opened.
  useEffect(() => {
    if (!originalOpen || !document.originalFile || fileUrl || fileError) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`/api/documents/${slug}/file`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) throw new Error(String(res.status));
        const blob = await res.blob();
        if (!cancelled) setFileUrl(URL.createObjectURL(blob));
      } catch {
        if (!cancelled) setFileError(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalOpen, slug]);

  // Release the blob URL only when it changes or the screen unmounts.
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  const deadline = isValidIsoDate(document.deadline) ? document.deadline : null;
  const issuer = tr(document.issuer);
  const what = tr(document.what);
  const why = tr(document.why);
  const steps = (document.steps ?? []).map((s) => tr(s)).filter(Boolean);
  const personal = document.personal ?? [];

  const byWhenText = deadline
    ? `Submit or renew by ${formatDate(deadline, language)}.`
    : 'There is no deadline printed on this document.';

  const listenText = [what, why, steps.join('. '), byWhenText, tr(document.explain)].filter(Boolean).join('. ');
  const speaking = speech.state === 'speaking';
  // Returns a click handler that speaks just this section, or undefined when TTS is unavailable.
  const say = (text: string) => (speech.supported && text ? () => speech.speak(text) : undefined);

  return (
    <div className="space-y-3.5 px-4 pb-6 pt-4">
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

      {/* Q&A explanation cards — each with a speaker to hear just that part */}
      {what && (
        <QACard tone="blue" icon="doc" title="What is this?" onListen={say(what)}>
          {what}
        </QACard>
      )}
      {why && (
        <QACard tone="purple" icon="help" title="Why did I receive this?" onListen={say(why)}>
          {why}
        </QACard>
      )}
      {steps.length > 0 && (
        <QACard tone="green" icon="tasks" title="What should I do?" onListen={say(steps.map((s, i) => `${i + 1}. ${s}`).join('. '))}>
          <ol className="space-y-1.5">
            {steps.map((step: string, i: number) => (
              <li key={i} className="flex gap-2">
                <span className="font-bold text-[#2FA66A]">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </QACard>
      )}
      <QACard tone="orange" icon="calendar" title="By when?" onListen={say(byWhenText)}>
        {byWhenText}
      </QACard>

      {/* Listen to explanation — reads every key point */}
      <button
        type="button"
        disabled={!speech.supported || !listenText}
        onClick={() => (speaking ? speech.stop() : speech.speak(listenText))}
        className="flex w-full items-center justify-center gap-2.5 rounded-[16px] px-4 py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(23,58,120,0.22)] transition active:translate-y-px disabled:opacity-50"
        style={{ backgroundColor: NAVY }}
      >
        <Icon name={speaking ? 'close' : 'play'} className="h-5 w-5" />
        {speaking ? 'Stop' : 'Listen to explanation'}
      </button>
      {!speech.supported && (
        <p className="-mt-1 text-center text-xs text-[#667085]">
          Voice output isn&apos;t available in this browser.
        </p>
      )}

      {/* Find matching schemes */}
      <button
        type="button"
        onClick={onSchemes}
        className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-[#D6E0F5] bg-[#EAF1FF] px-4 py-4 text-base font-bold text-[#173A78] active:bg-[#DDE8FB]"
      >
        Find matching schemes
        <Icon name="right" className="h-4 w-4" />
      </button>

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

      {/* Your details (extracted information) */}
      {personal.length > 0 && (
        <div className="rounded-[20px] border border-[#EAF1FF] bg-white p-4 shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
          <h2 className="v2-heading text-base font-bold text-[#101828]">Your details</h2>
          <dl className="mt-3 space-y-3">
            {personal.map((field, i) => {
              const show = revealed[i];
              return (
                <div key={i} className="flex items-center justify-between gap-3">
                  <dt className="text-sm text-[#6B7890]">{tr(field.label)}</dt>
                  <dd className="flex items-center gap-2 text-right text-sm font-bold tabular-nums text-[#101828]">
                    <span>{field.sensitive && !show ? '•••••' : field.value}</span>
                    {field.sensitive && (
                      <button
                        type="button"
                        onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))}
                        className="text-xs font-semibold text-[#173A78]"
                      >
                        {show ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}

      {/* See the original document — the uploaded file, then the read-off text */}
      {(document.original || document.originalFile) && (
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
            <div className="space-y-4 border-t border-[#EAF1FF] p-4">
              {document.originalFile && (
                <div>
                  {fileError ? (
                    <p className="text-sm text-[#667085]">The uploaded file is no longer available.</p>
                  ) : !fileUrl ? (
                    <p className="text-sm text-[#667085]">Loading your uploaded file…</p>
                  ) : isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fileUrl} alt={document.originalFile.name} className="w-full rounded-[12px] border border-[#EAF1FF]" />
                  ) : (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-[12px] bg-[#EAF1FF] p-3 text-sm font-semibold text-[#173A78]"
                    >
                      <Icon name="doc" className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">Open the uploaded file — {document.originalFile.name}</span>
                      <Icon name="right" className="h-4 w-4 shrink-0" />
                    </a>
                  )}
                </div>
              )}
              {document.original && (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#101828]">
                  {document.original}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Nearby Mee Seva */}
      <button
        type="button"
        onClick={onMeeSeva}
        className="flex w-full items-center gap-3 rounded-[18px] border border-[#EAF1FF] bg-white p-4 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F5F8FF]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#FFF4E7] text-[#F6A23A]">
          <Icon name="scan" className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-bold text-[#101828]">Visit a nearby Mee Seva centre</span>
          <span className="mt-0.5 block text-xs text-[#6B7890]">Find the closest centre to submit this in person</span>
        </span>
        <Icon name="right" className="h-5 w-5 shrink-0 text-[#C6D0E4]" />
      </button>

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
