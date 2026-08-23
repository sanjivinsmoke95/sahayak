import { api } from '@/lib/api-client';
import type { AssistantAnswer, EligibilityProfile, EligibilityResult, LanguageCode } from '@/types';

export const assistantService = {
  ask: (
    payload: { question: string; lang: LanguageCode; documentId?: string | null; modelId?: string | null },
    token?: string | null,
  ) => api.post<AssistantAnswer>('/assistant/ask', payload, token),

  checkEligibility: (
    payload: { documentId: string; lang: LanguageCode; profile: EligibilityProfile },
    token?: string | null,
  ) => api.post<EligibilityResult>('/assistant/eligibility', payload, token),
};
