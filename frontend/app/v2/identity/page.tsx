'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/common';
import { Sheet } from '@/components/ui';
import {
  useDeleteIdentity,
  useIdentities,
  useIdentityAudit,
  useRevealIdentity,
  useSaveIdentity,
  useTranslation,
} from '@/hooks';
import type { StringKey } from '@/lib/i18n';
import { ApiRequestError } from '@/lib/api-client';
import type { IdentityKind } from '@/types';
import { buzz, fill } from '@/utils/format';

const KINDS: { kind: IdentityKind; labelKey: StringKey; placeholderKey: StringKey }[] = [
  { kind: 'aadhaar', labelKey: 'idAadhaar', placeholderKey: 'idPlaceholderAadhaar' },
  { kind: 'pan', labelKey: 'idPan', placeholderKey: 'idPlaceholderPan' },
];

const ACTION_LABEL: Record<string, StringKey> = {
  created: 'idActionCreated',
  updated: 'idActionUpdated',
  viewed: 'idActionViewed',
  deleted: 'idActionDeleted',
  denied: 'idActionDenied',
};

export default function V2IdentityPage() {
  const { t } = useTranslation();
  const { data: records } = useIdentities();
  const { data: audit } = useIdentityAudit();
  const save = useSaveIdentity();
  const remove = useDeleteIdentity();
  const { revealed, reveal, hide, autoHideSeconds } = useRevealIdentity();

  const [editing, setEditing] = useState<IdentityKind | null>(null);
  const [draft, setDraft] = useState('');
  const [confirming, setConfirming] = useState<IdentityKind | null>(null);

  const recordFor = (kind: IdentityKind) => (records ?? []).find((r) => r.kind === kind);

  const startEdit = (kind: IdentityKind) => { setDraft(''); setEditing(kind); };

  const submit = (kind: IdentityKind) => {
    save.mutate(
      { kind, value: draft },
      {
        onSuccess: () => {
          // The draft is the only place the typed number lived; drop it now.
          setDraft('');
          setEditing(null);
          toast.success(t('idSaved'));
        },
        onError: (err) => {
          const known = err instanceof ApiRequestError && err.status >= 400 && err.status < 500;
          toast.error(known ? err.message : t('idUnavailable'));
        },
      },
    );
  };

  const confirmReveal = (kind: IdentityKind) => {
    setConfirming(null);
    buzz();
    reveal(kind, {
      onError: () => toast.error(t('idUnavailable')),
    } as never);
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="v2-heading text-2xl font-bold text-[#101828]">{t('idTitle')}</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#667085]">{t('idSubtitle')}</p>
      </header>

      <div className="flex items-start gap-2.5 rounded-[16px] bg-[#EAF7EF] p-3.5">
        <Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0 text-[#2E9B67]" />
        <p className="text-[13px] font-semibold leading-relaxed text-[#2E9B67]">
          {t('idStoredSafely')}
        </p>
      </div>

      <div className="space-y-3">
        {KINDS.map(({ kind, labelKey, placeholderKey }) => {
          const record = recordFor(kind);
          const shown = revealed[kind];
          const isEditing = editing === kind;

          return (
            <section
              key={kind}
              className="rounded-[18px] border border-[#EAF1FF] bg-white p-4 shadow-[0_1px_4px_rgba(16,40,99,0.05)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-bold text-[#101828]">{t(labelKey)}</h2>
                {record && !isEditing && (
                  <button
                    type="button"
                    onClick={() => startEdit(kind)}
                    className="text-xs font-semibold text-[#173A78]"
                  >
                    {t('idChange')}
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="mt-3 space-y-2.5">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t(placeholderKey)}
                    inputMode={kind === 'aadhaar' ? 'numeric' : 'text'}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    // Keeps the value out of the browser's saved form data.
                    data-lpignore="true"
                    className="w-full rounded-[12px] border border-[#D6DDE8] px-3.5 py-3 text-base tabular-nums text-[#101828] outline-none focus:border-[#173A78]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!draft.trim() || save.isPending}
                      onClick={() => submit(kind)}
                      className="flex-1 rounded-[12px] bg-[#173A78] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {t('idSave')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDraft(''); setEditing(null); }}
                      className="rounded-[12px] bg-[#EEF2F8] px-4 py-2.5 text-sm font-semibold text-[#101828]"
                    >
                      {t('idCancel')}
                    </button>
                  </div>
                </div>
              ) : record ? (
                <div className="mt-2.5">
                  <p className="text-lg font-bold tabular-nums tracking-wide text-[#101828]">
                    {shown ?? record.masked}
                  </p>
                  {shown && (
                    <p className="mt-1 text-xs text-[#B54708]">
                      {fill(t('idHidesIn'), { n: autoHideSeconds })}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    {shown ? (
                      <button
                        type="button"
                        onClick={() => hide(kind)}
                        className="text-xs font-semibold text-[#173A78]"
                      >
                        {t('idHide')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirming(kind)}
                        className="text-xs font-semibold text-[#173A78]"
                      >
                        {t('idReveal')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        remove.mutate(kind, { onSuccess: () => toast.success(t('idRemoved')) })
                      }
                      className="text-xs font-semibold text-[#B42318]"
                    >
                      {t('idRemove')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <p className="text-sm text-[#98A2B3]">{t('idNotSaved')}</p>
                  <button
                    type="button"
                    onClick={() => startEdit(kind)}
                    className="rounded-full bg-[#EAF1FF] px-4 py-2 text-xs font-bold text-[#173A78]"
                  >
                    {t('idAdd')}
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="rounded-[18px] border border-[#EAF1FF] bg-white p-4">
        <h2 className="text-[15px] font-bold text-[#101828]">{t('idHistory')}</h2>
        {(audit ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-[#98A2B3]">{t('idHistoryEmpty')}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {(audit ?? []).slice(0, 10).map((entry, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-[#101828]">
                  {t(ACTION_LABEL[entry.action] ?? 'idActionViewed')}
                  <span className="ml-1.5 font-normal text-[#667085]">
                    {t(entry.kind === 'pan' ? 'idPan' : 'idAadhaar')}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-[#98A2B3]">
                  {new Date(entry.at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Sheet
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
        title={t('idRevealWarnTitle')}
        closeLabel={t('idCancel')}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-[14px] bg-[#FFF6E8] p-3.5">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-[#B54708]" />
            <p className="text-sm leading-relaxed text-[#B54708]">{t('idRevealWarnBody')}</p>
          </div>
          <button
            type="button"
            onClick={() => confirming && confirmReveal(confirming)}
            className="w-full rounded-[14px] bg-[#173A78] px-4 py-3 text-base font-bold text-white"
          >
            {t('idRevealConfirm')}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(null)}
            className="w-full rounded-[14px] bg-[#EEF2F8] px-4 py-3 text-base font-semibold text-[#101828]"
          >
            {t('idCancel')}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
