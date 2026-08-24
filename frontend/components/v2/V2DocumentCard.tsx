'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { V2Badge, statusTone } from './V2Badge';
import { useDocumentValidity, useTranslation } from '@/hooks';
import { CATS } from '@/lib/i18n';
import { useUiStore } from '@/store';
import type { SahayakDocument } from '@/types';
import { formatDate, daysUntil, isValidIsoDate } from '@/utils/format';

interface Props {
  document: SahayakDocument;
}

export function V2DocumentCard({ document: doc }: Props) {
  const router = useRouter();
  const { t, tr, language } = useTranslation();
  const setDirection = useUiStore((s) => s.setDirection);
  const { data: validity } = useDocumentValidity(doc.id);

  const validityLabel = validity?.status === 'valid' ? t('valid')
    : validity?.status === 'expiring' ? t('expiring')
    : validity?.status === 'expired' ? t('expired') : null;
  const validityTone = validity?.status === 'valid' ? 'good'
    : validity?.status === 'expiring' ? 'warn'
    : validity?.status === 'expired' ? 'danger' : 'grey';

  const deadline = isValidIsoDate(doc.deadline) ? doc.deadline : null;
  const days = deadline ? daysUntil(deadline) : null;

  return (
    <button
      type="button"
      onClick={() => { setDirection('push'); router.push(`/v2/documents/${doc.id}`); }}
      className="flex w-[140px] shrink-0 flex-col rounded-[16px] border border-[#D8D0C7] bg-white p-3 text-left shadow-[0_1px_4px_rgba(25,18,14,0.06)] active:bg-[#F6F3EF]"
    >
      <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#E1F0EF] text-[#0C6E6B]">
        <Icon name="doc" className="h-5 w-5" />
      </span>
      <span className="mt-2 block truncate text-sm font-bold text-[#19120E]">{tr(doc.title)}</span>
      {validityLabel && (
        <span className="mt-1.5">
          <V2Badge tone={validityTone as any}>{validityLabel}</V2Badge>
        </span>
      )}
      {days !== null && days >= 0 && days <= 90 && (
        <span className="mt-1 text-xs text-[#C97B1A]">
          Expires in {days} {days === 1 ? 'day' : 'days'}
        </span>
      )}
      <span className="mt-1 text-xs text-[#7A6E68]">
        {doc.received ? formatDate(doc.received, language) : tr(CATS[doc.cat])}
      </span>
    </button>
  );
}
