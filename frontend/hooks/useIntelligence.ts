'use client';

import { useQuery } from '@tanstack/react-query';
import { intelligenceService } from '@/services';
import type {
  ConsistencyResult,
  DiscoveryResult,
  DocumentValidity,
  FormAnalysis,
  Readiness,
  RejectionAnalysis,
  VerificationResult,
} from '@/types';
import { useAuthToken } from './useAuthToken';

export function useDocumentValidity(slug: string) {
  const getToken = useAuthToken();
  return useQuery<DocumentValidity>({
    queryKey: ['validity', slug],
    queryFn: async () => intelligenceService.validity(slug, await getToken()),
    enabled: !!slug,
  });
}

export function useConsistency() {
  const getToken = useAuthToken();
  return useQuery<ConsistencyResult>({
    queryKey: ['consistency'],
    queryFn: async () => intelligenceService.consistency(await getToken()),
  });
}

/** Readiness is fetched on demand (when the reader taps "Check my readiness"). */
export function useReadiness(serviceId: string, enabled: boolean) {
  const getToken = useAuthToken();
  return useQuery<Readiness>({
    queryKey: ['readiness', serviceId],
    queryFn: async () => intelligenceService.readiness(serviceId, await getToken()),
    enabled,
  });
}

export function useDiscovery() {
  const getToken = useAuthToken();
  return useQuery<DiscoveryResult>({
    queryKey: ['discovery'],
    queryFn: async () => intelligenceService.discovery(await getToken()),
  });
}

export function useRejection(slug: string) {
  const getToken = useAuthToken();
  return useQuery<RejectionAnalysis>({
    queryKey: ['rejection', slug],
    queryFn: async () => intelligenceService.rejection(slug, await getToken()),
    enabled: !!slug,
  });
}

export function useVerification(slug: string) {
  const getToken = useAuthToken();
  return useQuery<VerificationResult>({
    queryKey: ['verification', slug],
    queryFn: async () => intelligenceService.verification(slug, await getToken()),
    enabled: !!slug,
  });
}

export function useForm(slug: string) {
  const getToken = useAuthToken();
  return useQuery<FormAnalysis>({
    queryKey: ['form', slug],
    queryFn: async () => intelligenceService.form(slug, await getToken()),
    enabled: !!slug,
  });
}
