/** Health endpoint (backend status / offline banner). */
import type { GovHealth } from '@/types';
import { apiClient, unwrap } from './client';

export const healthApi = {
  get: () => unwrap<GovHealth>(apiClient.get('/services/health')),
};
