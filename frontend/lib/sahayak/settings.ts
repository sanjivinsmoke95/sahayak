import { api } from './client';
import type { SettingsRead } from './types';

export const settingsService = {
  get(token: string) {
    return api.get<SettingsRead>('/settings', undefined, token);
  },

  update(payload: Partial<SettingsRead>, token: string) {
    return api.patch<SettingsRead>('/settings', payload, token);
  },
};
