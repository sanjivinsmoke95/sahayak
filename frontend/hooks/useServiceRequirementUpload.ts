'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { documentSatisfies } from '@/lib/requirement-match';
import { analyzeUploadedFile, classifyVerdict } from '@/lib/upload';
import { documentsService } from '@/services';
import { useSettingsStore } from '@/store';
import { useAuthToken } from './useAuthToken';

export type SlotResultKind = 'satisfied' | 'valid-other' | 'unsure' | 'not-gov' | 'error';
export interface SlotResult {
  kind: SlotResultKind;
  docType?: string;
}

/**
 * Upload a document into a specific requirement slot of a government service.
 *
 * The file is analysed and classified. A valid government document is kept and
 * added to My Documents; if its type matches the requirement the slot is
 * satisfied, otherwise it is stored but the slot stays open (with a note that
 * this document does not satisfy this requirement). Unclear or non-government
 * uploads are removed. Matching is by detected type, never filename.
 */
export function useServiceRequirementUpload() {
  const getToken = useAuthToken();
  const autoShrink = useSettingsStore((s) => s.autoShrink);
  const queryClient = useQueryClient();
  const [busySlot, setBusySlot] = useState<string | null>(null);

  const upload = useCallback(
    async (requirementEn: string, file: File): Promise<SlotResult> => {
      setBusySlot(requirementEn);
      try {
        const token = await getToken();
        const doc = await analyzeUploadedFile(file, { autoShrink, token });
        const verdict = classifyVerdict(doc);

        if (verdict === 'unsure') {
          await documentsService.remove(doc.id, token);
          return { kind: 'unsure' };
        }
        if (verdict === 'not-government') {
          await documentsService.remove(doc.id, token);
          return { kind: 'not-gov', docType: doc.docType };
        }

        // Valid government document — keep it and refresh the lists.
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents });
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.checklists });

        return {
          kind: documentSatisfies(requirementEn, doc) ? 'satisfied' : 'valid-other',
          docType: doc.docType,
        };
      } catch {
        return { kind: 'error' };
      } finally {
        setBusySlot(null);
      }
    },
    [autoShrink, getToken, queryClient],
  );

  return { upload, busySlot };
}
