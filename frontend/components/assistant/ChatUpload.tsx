'use client';

import { useRef, useState } from 'react';
import { Icon } from '@/components/common';
import { useChatDocumentUpload, useTranslation } from '@/hooks';

const ACCEPT = 'application/pdf,image/jpeg,image/jpg,image/png';

/**
 * Attach a document to the conversation. One at a time: the reader uploads a
 * notice, the assistant reads it back, and the button then offers to add
 * another so questions can span several documents.
 */
export function ChatUpload() {
  const { t } = useTranslation();
  const { handleFile, busy } = useChatDocumentUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasAttached, setHasAttached] = useState(false);

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    const ok = await handleFile(file);
    if (ok) setHasAttached(true);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          void onPick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-700 shadow-sm transition hover:bg-navy-50 disabled:opacity-60"
      >
        <Icon name={busy ? 'spark' : 'upload'} className={busy ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
        {busy ? t('chatReading') : hasAttached ? t('chatAddAnother') : t('chatUpload')}
      </button>
    </>
  );
}
