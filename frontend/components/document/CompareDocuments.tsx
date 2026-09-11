'use client';

import { useState } from 'react';
import { Icon } from '@/components/common';
import { Badge } from '@/components/ui';
import { useConsistency, useDocument, useDocuments, useTranslation } from '@/hooks';
import { redactSensitive } from '@/lib/redact';
import type { SahayakDocument } from '@/types';

const norm = (v: string) => v.trim().toLowerCase().replace(/\s+/g, ' ');

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [];
    for (let j = 0; j <= n; j++) {
      if (i === 0) { dp[i][j] = j; continue; }
      if (j === 0) { dp[i][j] = i; continue; }
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Names: treat as matching if edit distance ≤ 35% of the longer name. */
function valuesMatch(key: string, a: string, b: string): boolean {
  const na = norm(a), nb = norm(b);
  if (na === nb) return true;
  if (key === 'name' || key === 'father' || key === 'mother') {
    const dist = levenshtein(na, nb);
    return dist / Math.max(na.length, nb.length) <= 0.35;
  }
  return false;
}

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

export function CompareDocuments({ document: doc }: { document: SahayakDocument }) {
  const { t, tr } = useTranslation();
  const { data: documents } = useDocuments();
  const { data: consistency } = useConsistency();

  const others = (documents ?? []).filter((d) => d.id !== doc.id);
  const [otherId, setOtherId] = useState<string | null>(others[0]?.id ?? null);
  const { data: other, isLoading } = useDocument(otherId ?? '');

  if (others.length === 0) return null;

  // Sync default when documents load
  const activeId = otherId ?? others[0]?.id ?? null;

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
        match: valuesMatch(key, fa.value, fb.value),
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
        match: valuesMatch(key, issue.values[ai] ?? '', issue.values[bi] ?? ''),
      });
    }

    return [...rows.values()];
  }

  const rows = buildRows();
  const show = (v: string, sensitive: boolean) => (sensitive ? redactSensitive(v) : v);
  const mismatches = rows.filter((r) => !r.match).length;

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#EAF1FF] bg-white shadow-[0_1px_4px_rgba(16,40,99,0.05)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[#EAF1FF] text-[#173A78]">
          <Icon name="scan" className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-[15px] font-bold text-[#101828]">{t('conTitle')}</p>
          {!isLoading && rows.length > 0 && (
            <p className="mt-0.5 text-xs text-[#6B7890]">
              {mismatches === 0
                ? `All ${rows.length} fields match`
                : `${mismatches} of ${rows.length} fields differ`}
            </p>
          )}
        </div>
        {!isLoading && mismatches > 0 && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-100 text-amber-600">
            <Icon name="alert" className="h-4 w-4" strokeWidth={2} />
          </span>
        )}
        {!isLoading && mismatches === 0 && rows.length > 0 && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#EDFDF4] text-[#16a34a]">
            <Icon name="check" className="h-4 w-4" strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Document selector — shown only when there are multiple to pick from */}
      {others.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
          {others.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setOtherId(d.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                activeId === d.id
                  ? 'bg-[#173A78] text-white'
                  : 'bg-[#F0F4FF] text-[#173A78]'
              }`}
            >
              {tr(d.title)}
            </button>
          ))}
        </div>
      )}

      {/* Comparison column labels */}
      {other && rows.length > 0 && (
        <div className="grid grid-cols-2 gap-px border-t border-[#EAF1FF] bg-[#EAF1FF]">
          <div className="bg-[#F5F8FF] px-4 py-2">
            <p className="truncate text-[11px] font-bold uppercase tracking-wide text-[#173A78]">
              {tr(doc.title)}
            </p>
          </div>
          <div className="bg-[#F5F8FF] px-4 py-2">
            <p className="truncate text-[11px] font-bold uppercase tracking-wide text-[#173A78]">
              {tr(other.title)}
            </p>
          </div>
        </div>
      )}

      {/* Rows */}
      {isLoading ? (
        <div className="space-y-px border-t border-[#EAF1FF]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-2 gap-px bg-[#EAF1FF]">
              <div className="h-14 animate-pulse bg-white" />
              <div className="h-14 animate-pulse bg-white" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="border-t border-[#EAF1FF] px-4 py-4 text-sm leading-relaxed text-[#6B7890]">
          {t('cmpNoCommon')}
        </p>
      ) : (
        <div className="divide-y divide-[#EAF1FF]">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-2 gap-px bg-[#EAF1FF]">
              {/* Doc A */}
              <div className={`bg-white px-4 py-3 ${!row.match ? 'bg-amber-50/60' : ''}`}>
                <p className="mb-0.5 text-[11px] font-semibold text-[#6B7890]">{row.label}</p>
                <p className="break-words text-sm font-semibold text-[#101828]">{show(row.a, row.sensitive)}</p>
              </div>
              {/* Doc B */}
              <div className={`relative bg-white px-4 py-3 ${!row.match ? 'bg-amber-50/60' : ''}`}>
                <div className="mb-0.5 flex items-center gap-1.5">
                  <Badge tone={row.match ? 'leaf' : 'amber'}>
                    <span className="flex items-center gap-1">
                      <Icon name={row.match ? 'check' : 'alert'} className="h-3 w-3" strokeWidth={row.match ? 3 : 2} />
                      {row.match ? t('cmpMatch') : t('cmpMismatch')}
                    </span>
                  </Badge>
                </div>
                <p className="break-words text-sm font-semibold text-[#101828]">{show(row.b, row.sensitive)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer note */}
      {rows.length > 0 && (
        <p className="border-t border-[#EAF1FF] px-4 py-3 text-xs leading-relaxed text-[#6B7890]">
          {t('conNote')}
        </p>
      )}
    </section>
  );
}
