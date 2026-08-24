'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { useDocumentValidity, useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { useUiStore } from '@/store';
import type { SahayakDocument } from '@/types';
import { formatDate } from '@/utils/format';
import { V2Badge, statusTone } from './V2Badge';

const DOC_STATUS_KEY: Record<string, string> = {
  action: 'statusAction',
  done: 'statusDone',
  info: 'statusInfo',
};

const VALIDITY_BADGE: Record<string, { tone: 'good' | 'warn' | 'danger' | 'grey'; key: string }> = {
  valid: { tone: 'good', key: 'valid' },
  expiring: { tone: 'warn', key: 'expiring' },
  expired: { tone: 'danger', key: 'expired' },
};

export function V2DocumentRow({ document: doc, basePath = '/v2' }: { document: SahayakDocument; basePath?: string }) {
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: validity } = useDocumentValidity(doc.id);

  const received = formatDate(doc.received, language);
  const badge = validity?.status ? VALIDITY_BADGE[validity.status] : null;

  return (
    <button
      type="button"
      onClick={() => {
        setDirection('push');
        router.push(`${basePath}/documents/${doc.id}`);
      }}
      className="flex w-full items-center gap-3 p-3.5 text-left transition active:bg-[#EDE9E3]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-[#E1F0EF] text-[#0C6E6B]">
        <Icon name="doc" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold leading-snug text-[#19120E]">{tr(doc.title)}</span>
        <span className="mt-0.5 block truncate text-sm text-[#7A6E68]">
          {tr(CATS[doc.cat])}
          {received ? ` · ${received}` : ''}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        {badge && <V2Badge tone={badge.tone}>{t(badge.key)}</V2Badge>}
        {doc.status !== 'info' && !badge && (
          <V2Badge tone={statusTone(doc.status)}>{t(DOC_STATUS_KEY[doc.status] ?? 'statusInfo')}</V2Badge>
        )}
      </span>
      <Icon name="right" className="h-5 w-5 shrink-0 text-[#D8D0C7]" />
    </button>
  );
}
