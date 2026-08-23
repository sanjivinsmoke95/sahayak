/** Crawl trigger (admin / refresh). */
import type { CrawlResponse } from '@/types';
import { apiClient, unwrap } from './client';

export const crawlerApi = {
  trigger: (sources?: string[]) =>
    unwrap<CrawlResponse>(apiClient.post('/services/crawl', sources ?? null)),
};
