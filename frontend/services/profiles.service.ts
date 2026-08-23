import { api } from '@/lib/api-client';
import type { Profile, ProfileCreatePayload } from '@/types';

export const profilesService = {
  list: (token?: string | null) => api.get<Profile[]>('/profiles', token),

  create: (payload: ProfileCreatePayload, token?: string | null) =>
    api.post<Profile>('/profiles', payload, token),

  remove: (id: string, token?: string | null) => api.delete<void>(`/profiles/${id}`, token),

  assignDocument: (slug: string, profileId: string, token?: string | null) =>
    api.patch<void>(`/documents/${slug}/profile`, { profileId }, token),
};
