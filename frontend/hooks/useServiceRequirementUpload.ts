'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/constants';
import { documentSatisfies } from '@/lib/requirement-match';
import { analyzeUploadedFile, classifyVerdict } from '@/lib/upload';
import { documentsService } from '@/services';
import { useSettingsStore } from '@/store';
import type { SahayakDocument } from '@/types';
import { useAuthToken } from './useAuthToken';

export type SlotResultKind = 'satisfied' | 'valid-other' | 'unsure' | 'not-gov' | 'error';
export interface SlotResult {
  kind: SlotResultKind;
  docType?: string;
  identityMismatch?: boolean;
}

function norm(v: string) {
  return v.trim().toLowerCase().replace(/\s+/g, ' ');
}

type PersonalEntry = { label: string; value: string };

function findPersonalField(personal: PersonalEntry[] | undefined, field: 'name' | 'dob'): string | undefined {
  return personal?.find((p) => {
    const l = p.label.toLowerCase();
    if (field === 'name') {
      return l.includes('name') && !l.includes('father') && !l.includes('mother') && !l.includes('husband');
    }
    return l.includes('birth') || l === 'dob';
  })?.value;
}

function checkIdentityMismatch(newDoc: SahayakDocument, existingDocs: SahayakDocument[]): boolean {
  const personal = newDoc.personal as PersonalEntry[] | undefined;
  if (!personal?.length) return false;
  const newName = findPersonalField(personal, 'name');
  const newDob = findPersonalField(personal, 'dob');
  if (!newName && !newDob) return false;

  for (const existing of existingDocs) {
    if (existing.id === newDoc.id) continue;
    const ep = existing.personal as PersonalEntry[] | undefined;
    if (!ep?.length) continue;
    const existingName = findPersonalField(ep, 'name');
    const existingDob = findPersonalField(ep, 'dob');
    if (newName && existingName && norm(newName) !== norm(existingName)) return true;
    if (newDob && existingDob && norm(newDob) !== norm(existingDob)) return true;
  }
  return false;
}

/**
 * Upload a document into a specific requirement slot of a government service.
 *
 * The file is analysed and classified. A valid government document is kept and
 * added to My Documents; if its type matches the requirement the slot is
 * satisfied, otherwise it is stored but the slot stays open (with a note that
 * this document does not satisfy this requirement). Unclear or non-government
 * uploads are removed. Matching is by detected type, never filename.
 * Identity is checked by comparing name/DOB fields against existing documents.
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
        // Snapshot existing docs before upload for identity comparison.
        const existingDocs = queryClient.getQueryData<SahayakDocument[]>(QUERY_KEYS.documents) ?? [];

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

        const identityMismatch = checkIdentityMismatch(doc, existingDocs);

        return {
          kind: documentSatisfies(requirementEn, doc) ? 'satisfied' : 'valid-other',
          docType: doc.docType,
          identityMismatch,
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
