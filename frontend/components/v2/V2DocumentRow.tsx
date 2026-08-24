'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { V2Badge, statusTone } from './V2Badge';
import { useDocumentValidity, useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { useUiStore } from '@/store';
import type { SahayakDocument } from '@/types';
import { formatDate } from '@/utils/format';

const VALIDITY_BADGE: Record<string, { tone: 'good' | 'warn' | 'danger' | 'grey'; key: string }> = {
  valid: { tone: 'good', key: 'valid' },
  expiring: { tone: 'warn', key: 'expiring' },
  expired: { tone: 'danger', key: 'expired' },
};

export function V2DocumentRow({ document: doc }: { document: SahayakDocument }) {
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: validity } = useDocumentValidity(doc.id);

  const received = formatDate(doc.received, language);
  const badge = validity?.status ? VALIDITY_BADGE[validity.status] : null;

  return (
    <button
      type="button"
      onClick={() => { setDirection('push'); router.push(`/v2/documents/${doc.id}`); }}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-[#F6F3EF]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#E1F0EF] text-[#0C6E6B]">
        <Icon name="doc" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-bold text-[#19120E]">{tr(doc.title)}</span>
          {badge && <V2Badge tone={badge.tone}>{t(badge.key)}</V2Badge>}
        </span>
        <span className="mt-0.5 block text-xs text-[#7A6E68]">
          {received ? `Updated on ${received}` : tr(CATS[doc.cat])}
        </span>
      </span>
      <span className="shrink-0 text-[#D8D0C7]">
        <Icon name="more" className="h-5 w-5" />
      </span>
    </button>
  );
}
