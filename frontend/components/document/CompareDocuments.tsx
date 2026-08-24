'use client';

import { useState } from 'react';
import { Icon } from '@/components/common';
import { Badge, Button, Sheet } from '@/components/ui';
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

    // 1) Fields each document exposes itself.
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

    // 2) Name / DOB checks Sahayak already computed across documents.
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
    <section className="rounded-xl2 border border-navy-100 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
          <Icon name="scan" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold leading-snug">{t('conTitle')}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">{t('cmpPrompt')}</p>
        </div>
      </div>

      <Button
        className="mt-3"
        full
        size="md"
        variant="secondary"
        disabled={others.length === 0}
        onClick={() => {
          setOtherId(null);
          setOpen(true);
        }}
      >
        <Icon name="scan" className="h-5 w-5" />
        {t('cmpStart')}
      </Button>
      {others.length === 0 && <p className="mt-2 text-sm text-muted">{t('cmpNoOther')}</p>}

      <Sheet open={open} onOpenChange={setOpen} title={t('cmpStart')} closeLabel={t('close')}>
        {!otherId ? (
          <>
            <p className="mb-2 text-sm font-semibold text-muted">{t('cmpPick')}</p>
            <ul className="space-y-2">
              {others.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => setOtherId(d.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-navy-200 bg-white p-3.5 text-left active:bg-navy-50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
                      <Icon name="doc" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-base font-semibold">
                      {tr(d.title)}
                    </span>
                    <Icon name="right" className="h-5 w-5 shrink-0 text-navy-300" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            {/* Which two documents are being compared. */}
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span className="min-w-0 flex-1 truncate rounded-lg bg-navy-50 px-2.5 py-1.5 text-navy-700">
                {tr(doc.title)}
              </span>
              <Icon name="scan" className="h-4 w-4 shrink-0 text-muted" />
              <span className="min-w-0 flex-1 truncate rounded-lg bg-navy-50 px-2.5 py-1.5 text-navy-700">
                {other ? tr(other.title) : '…'}
              </span>
            </div>

            {otherLoading ? (
              <p className="rounded-xl bg-navy-50 p-3.5 text-base text-muted">{t('cmpLoading')}</p>
            ) : rows.length === 0 ? (
              <p className="rounded-xl bg-navy-50 p-3.5 text-base leading-relaxed text-muted">
                {t('cmpNoCommon')}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {rows.map((row) => (
                  <li key={row.key} className="rounded-xl border border-navy-100 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">{row.label}</span>
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
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted">{tr(doc.title)}</p>
                        <p className="break-words text-sm font-medium">{show(row.a, row.sensitive)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted">{other ? tr(other.title) : ''}</p>
                        <p className="break-words text-sm font-medium">{show(row.b, row.sensitive)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-relaxed text-muted">
              {t('conNote')}
            </p>

            <Button
              className="mt-3"
              full
              size="md"
              variant="secondary"
              onClick={() => setOtherId(null)}
            >
              <Icon name="left" className="h-5 w-5" />
              {t('cmpChange')}
            </Button>
          </>
        )}
      </Sheet>
    </section>
  );
}
