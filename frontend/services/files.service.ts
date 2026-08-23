import { api, apiRequest } from '@/lib/api-client';
import type { UploadedFile } from '@/types';

export const filesService = {
  list: (token?: string | null) => api.get<UploadedFile[]>('/files', token),

  /**
   * Uploads the already-compressed blob. Compression happens on the device
   * before this is called, so the original never leaves the phone.
   */
  upload: (
    payload: { blob: Blob; name: string; originalSize?: number; documentId?: string | null },
    token?: string | null,
  ) => {
    const form = new FormData();
    form.append('file', payload.blob, payload.name);
    if (payload.originalSize) form.append('original_size_bytes', String(payload.originalSize));
    if (payload.documentId) form.append('document_id', payload.documentId);
    return apiRequest<UploadedFile>('/files', { method: 'POST', body: form, token });
  },

  remove: (id: string, token?: string | null) => api.delete<void>(`/files/${id}`, token),
};
