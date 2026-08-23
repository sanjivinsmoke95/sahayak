/** Statistics endpoint (home-page metrics). */
import type { GovStats } from '@/types';
import { apiClient, unwrap } from './client';

export const statsApi = {
  get: () => unwrap<GovStats>(apiClient.get('/services/stats')),
};
