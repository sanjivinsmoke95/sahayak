import { api } from '@/lib/api-client';
import type { UserSettings } from '@/types';

export const settingsService = {
  get: (token?: string | null) => api.get<UserSettings>('/settings', token),
  update: (payload: Partial<UserSettings>, token?: string | null) =>
    api.patch<UserSettings>('/settings', payload, token),
};
