import { api } from './client';
import type { DocumentRead, FileRead } from './types';

export const documentsService = {
  upload(file: File, token: string) {
    const form = new FormData();
    form.append('file', file);
    return api.upload<FileRead>('/files', form, token);
  },

  analyze(payload: { fileId?: string; sampleId?: string; fileName?: string }, token: string) {
    return api.post<DocumentRead>('/documents/analyze', payload, token);
  },

  list(token: string) {
    return api.get<DocumentRead[]>('/documents', undefined, token);
  },

  get(slug: string, token: string) {
    return api.get<DocumentRead>(`/documents/${slug}`, undefined, token);
  },

  delete(slug: string, token: string) {
    return api.delete<void>(`/documents/${slug}`, token);
  },

  fileUrl(slug: string) {
    return `/api/documents/${slug}/file`;
  },
};
