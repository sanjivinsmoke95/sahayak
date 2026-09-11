'use client';

import { useState } from 'react';
import { Icon } from '@/components/common';
import { Badge, Sheet } from '@/components/ui';
import { useConsistency, useDocument, useDocuments, useTranslation } from '@/hooks';
import { redactSensitive } from '@/lib/redact';
import type { SahayakDocument } from '@/types';

/** Loose equality — ignores case and runs of whitespace. */
const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, ' ');

/** Collapse differently-worded labels onto one concept so "Full name" and "Name" line up. */
function canon(labelEn: string): string {
  const s = labelEn.toLowerCase();
  if (s.includes('father')) return 'father';
  if (s.includes('mother')) return 'mother';
  if (s.includes('birth') || s === 'dob') return 'dob';
  if (s.includes('address')) return 'address';
  if (s.includes('name')) return 'name';
  return s;
}

interface Row {
  key: string;
  label: string;
  a: string;
  b: string;
  sensitive: boolean;
  match: boolean;
}

/**
 * Optional, user-triggered document comparison. Nothing is compared until the
 * reader chooses a second document. It lines up the fields each document
 * exposes, and also folds in the name / date-of-birth checks Sahayak already
 * runs across documents — shown as "Match" or "Possible mismatch", never "wrong".
 */
export function CompareDocuments({ document: doc }: { document: SahayakDocument }) {
  const { t, tr } = useTranslation();
  const { data: documents } = useDocuments();
  const { data: consistency } = useConsistency();
  const [open, setOpen] = useState(false);
  const [otherId, setOtherId] = useState<string | null>(null);
  const { data: other, isLoading: otherLoading } = useDocument(otherId ?? '');

  const others = (documents ?? []).filter((d) => d.id !== doc.id);

  if (others.length === 0) return null;

  function buildRows(): Row[] {
    if (!other) return [];
    const rows = new Map<string, Row>();

    const mapB = new Map((other.personal ?? []).map((f) => [canon(f.label.en), f]));
    for (const fa of doc.personal ?? []) {
      const key = canon(fa.label.en);
      const fb = mapB.get(key);
      if (!fb) continue;
      rows.set(key, {
        key,
        label: tr(fa.label),
        a: fa.value,
        b: fb.value,
        sensitive: fa.sensitive || fb.sensitive,
        match: norm(fa.value) === norm(fb.value),
      });
    }

    const pairIssues = (consistency?.issues ?? []).filter(
      (i) => i.documents.includes(doc.id) && i.documents.includes(other.id),
    );
    for (const issue of pairIssues) {
      const key = issue.type === 'dob_mismatch' ? 'dob' : 'name';
      if (rows.has(key)) continue;
      const ai = issue.documents.indexOf(doc.id);
      const bi = issue.documents.indexOf(other.id);
      rows.set(key, {
        key,
        label: key === 'dob' ? t('cmpFieldDob') : t('cmpFieldName'),
        a: issue.values[ai] ?? '',
        b: issue.values[bi] ?? '',
        sensitive: false,
        match: norm(issue.values[ai] ?? '') === norm(issue.values[bi] ?? ''),
      });
    }

    return [...rows.values()];
  }

  const rows = buildRows();
  const show = (value: string, sensitive: boolean) => (sensitive ? redactSensitive(value) : value);

  return (
    <>
      {/* V2-style tappable card */}
      <button
        type="button"
        onClick={() => { setOtherId(null); setOpen(true); }}
        className="flex w-full items-center gap-3 rounded-[18px] border border-[#EAF1FF] bg-white p-4 text-left shadow-[0_1px_4px_rgba(16,40,99,0.05)] active:bg-[#F5F8FF]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EAF1FF] text-[#173A78]">
          <Icon name="scan" className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-bold text-[#101828]">{t('conTitle')}</span>
          <span className="mt-0.5 block text-xs text-[#6B7890]">{t('cmpPrompt')}</span>
        </span>
        <Icon name="right" className="h-5 w-5 shrink-0 text-[#C6D0E4]" />
      </button>

      <Sheet open={open} onOpenChange={setOpen} title={t('cmpStart')} closeLabel={t('close')}>
        {!otherId ? (
          <>
            <p className="mb-3 text-sm font-semibold text-[#6B7890]">{t('cmpPick')}</p>
            <ul className="space-y-2">
              {others.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setOtherId(d.id)}
                    className="flex w-full items-center gap-3 rounded-[14px] border border-[#EAF1FF] bg-white p-3.5 text-left active:bg-[#F5F8FF]"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#EAF1FF] text-[#173A78]">
                      <Icon name="doc" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#101828]">
                      {tr(d.title)}
                    </span>
                    <Icon name="right" className="h-5 w-5 shrink-0 text-[#C6D0E4]" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            {/* Which two documents are being compared */}
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <span className="min-w-0 flex-1 truncate rounded-[10px] bg-[#EAF1FF] px-3 py-2 text-[#173A78]">
                {tr(doc.title)}
              </span>
              <Icon name="scan" className="h-4 w-4 shrink-0 text-[#6B7890]" />
              <span className="min-w-0 flex-1 truncate rounded-[10px] bg-[#EAF1FF] px-3 py-2 text-[#173A78]">
                {other ? tr(other.title) : '…'}
              </span>
            </div>

            {otherLoading ? (
              <p className="rounded-[14px] bg-[#F5F8FF] p-4 text-sm text-[#6B7890]">{t('cmpLoading')}</p>
            ) : rows.length === 0 ? (
              <p className="rounded-[14px] bg-[#F5F8FF] p-4 text-sm leading-relaxed text-[#6B7890]">
                {t('cmpNoCommon')}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {rows.map((row) => (
                  <li key={row.key} className="rounded-[14px] border border-[#EAF1FF] bg-white p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#101828]">{row.label}</span>
                      <Badge tone={row.match ? 'leaf' : 'amber'}>
                        <span className="flex items-center gap-1">
                          <Icon
                            name={row.match ? 'check' : 'alert'}
                            className="h-3.5 w-3.5"
                            strokeWidth={row.match ? 3 : 2}
                          />
                          {row.match ? t('cmpMatch') : t('cmpMismatch')}
                        </span>
                      </Badge>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-3">
                      <div className="min-w-0 rounded-[10px] bg-[#F5F8FF] p-2.5">
                        <p className="mb-0.5 truncate text-[11px] font-semibold uppercase tracking-wide text-[#6B7890]">
                          {tr(doc.title)}
                        </p>
                        <p className="break-words text-sm font-medium text-[#101828]">{show(row.a, row.sensitive)}</p>
                      </div>
                      <div className="min-w-0 rounded-[10px] bg-[#F5F8FF] p-2.5">
                        <p className="mb-0.5 truncate text-[11px] font-semibold uppercase tracking-wide text-[#6B7890]">
                          {other ? tr(other.title) : ''}
                        </p>
                        <p className="break-words text-sm font-medium text-[#101828]">{show(row.b, row.sensitive)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-3 rounded-[14px] bg-[#F5F8FF] p-3 text-sm leading-relaxed text-[#6B7890]">
              {t('conNote')}
            </p>

            <button
              type="button"
              onClick={() => setOtherId(null)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#EAF1FF] bg-white py-3 text-sm font-semibold text-[#173A78] active:bg-[#F5F8FF]"
            >
              <Icon name="left" className="h-4 w-4" />
              {t('cmpChange')}
            </button>
          </>
        )}
      </Sheet>
    </>
  );
}
