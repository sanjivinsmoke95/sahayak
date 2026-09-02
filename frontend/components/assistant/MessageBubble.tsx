'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/common';
import { SourceCitations } from './SourceCitations';
import { useDocuments, useSpeech, useTranslation } from '@/hooks';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store';
import type { AssistantMessage } from '@/types';

function cleanAnswerText(text: string, hasOfficialCitations: boolean): string {
  if (!text) return text;

  // The bubble renders plain text, so strip the markdown the model emits:
  // heading hashes, and **bold** / __bold__ / *italic* emphasis markers.
  let cleaned = text
    .replace(/^#{1,6}[ \t]+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, '$1$2');
  // Fix escaped and raw markdown bullets (e.g., "\- " or "- " or "* ") to render as a clean Unicode bullet
  cleaned = cleaned.replace(/^[ \t]*\\*[-*][ \t]+/gm, '\u2022 ');

  if (!hasOfficialCitations) return cleaned.trim();

  const lines = cleaned.split('\n');
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (/^(Official link|Official application URL|Source URL|आधिकारिक लिंक|అధికారిక లింక్):\s*https?:\/\/\S+$/i.test(trimmed)) {
      return false;
    }
    if (/^https?:\/\/\S+$/i.test(trimmed)) {
      return false;
    }
    return true;
  });

  return filtered.join('\n').trim();
}

export function MessageBubble({ message }: { message: AssistantMessage }) {
  const router = useRouter();
  const { t, tr } = useTranslation();
  const { speak, supported, readAloud } = useSpeech();
  const { data: documents } = useDocuments();
  const setDirection = useUiStore((s) => s.setDirection);

  const mine = message.role === 'user';
  const referenced = (message.docRefs ?? [])
    .map((id) => documents?.find((d) => d.id === id))
    .filter(Boolean);

  const hasOfficialCitations = Boolean(
    message.citations?.some((c) => c.source_type === 'official_service'),
  );
  const displayText = cleanAnswerText(message.text, hasOfficialCitations);

  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed',
          mine ? 'bg-navy-600 text-white' : 'border border-navy-100 bg-white text-ink shadow-soft',
        )}
      >
        <p className="whitespace-pre-wrap">{displayText}</p>

        {message.list && message.list.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {message.list.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {referenced.length > 0 && (
          <div className="mt-3 space-y-2">
            {referenced.map((doc) => (
              <button
                key={doc!.id}
                type="button"
                onClick={() => {
                  setDirection('push');
                  router.push(`/v2/documents/${doc!.id}`);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl bg-navy-50 px-3 py-2.5 text-left text-navy-700"
              >
                <Icon name="doc" className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{tr(doc!.title)}</span>
                <Icon name="right" className="h-4 w-4 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {!mine && <SourceCitations citations={message.citations} />}

        {!mine && supported && readAloud && (
          <button
            type="button"
            onClick={() => speak(displayText)}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-navy-600"
          >
            <Icon name="speaker" className="h-4 w-4" />
            {t('readAloud')}
          </button>
        )}
      </div>
    </div>
  );
}
