'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiRequestError } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';
import { analyzeUploadedFile, classifyVerdict } from '@/lib/upload';
import { documentsService } from '@/services';
import { useChatStore, useSettingsStore, useWorkspaceStore } from '@/store';
import { fill } from '@/utils/format';
import type { Localized, SahayakDocument } from '@/types';
import { useAuthToken } from './useAuthToken';
import { useTranslation } from './useTranslation';

function buildDocumentAnalysis(
  doc: SahayakDocument,
  tr: (l: Localized | undefined) => string,
): string {
  const title = tr(doc.title) || 'Document';
  const issuer = tr(doc.issuer);
  const what = tr(doc.what);
  const why = tr(doc.why);
  const steps = (doc.steps ?? []).map((s) => tr(s)).filter(Boolean);
  const need = (doc.need ?? []).map((n) => tr(n)).filter(Boolean);
  const deadline = doc.deadline;

  const lines: string[] = [];
  lines.push(`📄 ${title}`);
  if (issuer) lines.push(`Issued by: ${issuer}`);
  lines.push('');

  if (what) {
    lines.push('What this document is:');
    lines.push(what);
    lines.push('');
  }

  if (why) {
    lines.push('Why you have it:');
    lines.push(why);
    lines.push('');
  }

  if (steps.length > 0) {
    lines.push('What to do next:');
    steps.forEach((step, i) => lines.push(`${i + 1}. ${step}`));
    lines.push('');
  }

  if (need.length > 0) {
    lines.push('What you may need:');
    need.forEach((item) => lines.push(`• ${item}`));
    lines.push('');
  }

  if (deadline) {
    lines.push(`⚠️ Deadline: ${deadline}`);
    lines.push('');
  }

  lines.push('You can now ask me anything about this document.');
  return lines.join('\n');
}

/**
 * Reads a document dropped into the assistant conversation, reusing the same
 * upload and analysis endpoints as the main flow. Shows an immediate
 * "Reading…" placeholder, then replaces it with a rich analysis card built
 * from the existing document fields — no navigation chip, no redirect.
 */
export function useChatDocumentUpload() {
  const getToken = useAuthToken();
  const { t, tr } = useTranslation();
  const autoShrink = useSettingsStore((s) => s.autoShrink);
  const addMessage = useChatStore((s) => s.addMessage);
  const replaceMessage = useChatStore((s) => s.replaceMessage);
  const setActiveDocumentId = useWorkspaceStore((s) => s.setActiveDocumentId);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const makeId = () => `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const say = useCallback(
    (text: string) =>
      addMessage({
        id: makeId(),
        role: 'assistant',
        text,
        createdAt: new Date().toISOString(),
      }),
    [addMessage],
  );

  const handleFile = useCallback(
    async (file: File | null | undefined): Promise<boolean> => {
      if (!file || busy) return false;
      setBusy(true);

      // Immediately show a reading placeholder — no lag for the user.
      const readingId = makeId();
      addMessage({
        id: readingId,
        role: 'assistant',
        text: t('chatReading'),
        createdAt: new Date().toISOString(),
      });

      try {
        const token = await getToken();
        const doc = await analyzeUploadedFile(file, { autoShrink, token });
        const verdict = classifyVerdict(doc);

        if (verdict === 'unsure') {
          await documentsService.remove(doc.id, token);
          replaceMessage(readingId, { text: t('chatUnsure') });
          return false;
        }
        if (verdict === 'not-government') {
          await documentsService.remove(doc.id, token);
          replaceMessage(readingId, {
            text: doc.docType
              ? fill(t('chatNotGovGuess'), { type: doc.docType })
              : t('chatNotGov'),
          });
          return false;
        }

        // A real government document: set as active context and show rich analysis.
        setActiveDocumentId(doc.id);
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents });
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklists });

        const richText = buildDocumentAnalysis(doc, tr);
        // No docRefs — we don't want a navigation chip that confuses users.
        replaceMessage(readingId, { text: richText });
        return true;
      } catch (err) {
        const isBusy = err instanceof ApiRequestError && err.status === 503;
        replaceMessage(readingId, { text: t(isBusy ? 'chatUploadBusy' : 'chatUploadFail') });
        return false;
      } finally {
        setBusy(false);
      }
    },
    [addMessage, autoShrink, busy, getToken, queryClient, replaceMessage, setActiveDocumentId, t, tr],
  );

  return { handleFile, busy };
}
