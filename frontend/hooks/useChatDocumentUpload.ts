'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiRequestError } from '@/lib/api-client';
import { QUERY_KEYS } from '@/lib/constants';
import { analyzeUploadedFile, classifyVerdict } from '@/lib/upload';
import { documentsService } from '@/services';
import { useChatStore, useSettingsStore, useWorkspaceStore } from '@/store';
import { fill } from '@/utils/format';
import { useAuthToken } from './useAuthToken';
import { useTranslation } from './useTranslation';

/**
 * Reads a document dropped into the assistant conversation, reusing the same
 * upload and analysis endpoints as the main flow. It classifies the result and
 * speaks back: what it detected (and makes it available as grounded context),
 * or a friendly note when the file is not a government document or is too
 * unclear to identify. Junk uploads are removed so they never clutter the
 * reader's saved documents.
 */
export function useChatDocumentUpload() {
  const getToken = useAuthToken();
  const { t, tr } = useTranslation();
  const autoShrink = useSettingsStore((s) => s.autoShrink);
  const addMessage = useChatStore((s) => s.addMessage);
  const setActiveDocumentId = useWorkspaceStore((s) => s.setActiveDocumentId);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const say = useCallback(
    (text: string, docRefs?: string[]) =>
      addMessage({
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        text,
        docRefs,
        createdAt: new Date().toISOString(),
      }),
    [addMessage],
  );

  const handleFile = useCallback(
    async (file: File | null | undefined): Promise<boolean> => {
      if (!file || busy) return false;
      setBusy(true);
      try {
        const token = await getToken();
        const doc = await analyzeUploadedFile(file, { autoShrink, token });
        const verdict = classifyVerdict(doc);

        if (verdict === 'unsure') {
          await documentsService.remove(doc.id, token);
          say(t('chatUnsure'));
          return false;
        }
        if (verdict === 'not-government') {
          await documentsService.remove(doc.id, token);
          say(doc.docType ? fill(t('chatNotGovGuess'), { type: doc.docType }) : t('chatNotGov'));
          return false;
        }

        // A real government document: keep it, ground on it, refresh lists.
        const typeName = doc.docType || tr(doc.title) || t('chatDetectedDoc');
        setActiveDocumentId(doc.id);
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents });
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklists });
        say(fill(t('chatDetected'), { type: typeName }), [doc.id]);
        return true;
      } catch (err) {
        // A 503 means the reader (vision AI) is temporarily unavailable / over
        // quota — not that the file was unreadable. Say so honestly.
        const busy = err instanceof ApiRequestError && err.status === 503;
        say(t(busy ? 'chatUploadBusy' : 'chatUploadFail'));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [autoShrink, busy, getToken, queryClient, say, setActiveDocumentId, t, tr],
  );

  return { handleFile, busy };
}
