import { api } from '@/lib/api-client';
import type {
  ConsistencyResult,
  DiscoveryResult,
  DocumentValidity,
  FormAnalysis,
  Readiness,
  RejectionAnalysis,
  VerificationResult,
} from '@/types';

export const intelligenceService = {
  validity: (slug: string, token?: string | null) =>
    api.get<DocumentValidity>(`/documents/${slug}/validity`, token),

  consistency: (token?: string | null) => api.get<ConsistencyResult>('/consistency', token),

  discovery: (token?: string | null) => api.get<DiscoveryResult>('/discovery', token),

  readiness: (serviceId: string, token?: string | null) =>
    api.get<Readiness>(`/services/${serviceId}/readiness`, token),

  rejection: (slug: string, token?: string | null) =>
    api.get<RejectionAnalysis>(`/documents/${slug}/rejection`, token),

  verification: (slug: string, token?: string | null) =>
    api.get<VerificationResult>(`/documents/${slug}/verification`, token),

  form: (slug: string, token?: string | null) =>
    api.get<FormAnalysis>(`/documents/${slug}/form`, token),
};
