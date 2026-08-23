import { api } from '@/lib/api-client';
import type { ChecklistMap, SahayakDocument } from '@/types';

export interface AnalyzeRequest {
  /** Set when demonstrating with a bundled sample notice. */
  sampleId?: string;
  fileId?: string;
  fileName?: string;
}

export const documentsService = {
  list: (token?: string | null) => api.get<SahayakDocument[]>('/documents', token),

  get: (id: string, token?: string | null) => api.get<SahayakDocument>(`/documents/${id}`, token),

  analyze: (payload: AnalyzeRequest, token?: string | null) =>
    api.post<SahayakDocument>('/documents/analyze', payload, token),

  remove: (id: string, token?: string | null) => api.delete<void>(`/documents/${id}`, token),

  clearAll: (token?: string | null) => api.delete<void>('/documents', token),

  getChecklists: (token?: string | null) => api.get<ChecklistMap>('/documents/checklists', token),

  toggleChecklistItem: (
    payload: { documentId: string; kind: 'steps' | 'need'; index: number; done: boolean },
    token?: string | null,
  ) => api.patch<ChecklistMap>('/documents/checklists', payload, token),

  setReminder: (documentId: string, enabled: boolean, token?: string | null) =>
    api.patch<Record<string, boolean>>('/documents/reminders', { documentId, enabled }, token),
};
