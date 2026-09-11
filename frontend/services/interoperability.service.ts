import { api } from '@/lib/api-client';

/**
 * Government interoperability (SIH26129).
 *
 * A citizen changes their address or phone once, consents, and the change is
 * propagated to the connected government systems. Every call is scoped to the
 * signed-in citizen server-side; nothing here passes a citizen id.
 */

export type GovSystem = 'aadhaar' | 'pan' | 'rto' | 'passport' | 'voter';
export type SyncField = 'address' | 'phone';
export type SystemStatus = 'success' | 'failed' | 'pending';
export type BatchStatus = 'pending' | 'success' | 'partial' | 'failed' | 'denied';

export interface AddressValue {
  line1: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CitizenProfile {
  fullName: string;
  dob: string;
  address: AddressValue;
  phone: string;
}

export interface SystemResult {
  system: GovSystem;
  label: string;
  status: SystemStatus;
  error: string | null;
  attempts: number;
}

export interface SyncResponse {
  batchId: string;
  field: SyncField;
  success: boolean;
  status: BatchStatus;
  results: SystemResult[];
}

export interface SyncBatchRecord {
  batchId: string;
  field: SyncField;
  status: BatchStatus;
  oldValue: unknown;
  newValue: unknown;
  consented: boolean;
  results: SystemResult[];
  at: string;
}

export interface ConnectedSystem {
  system: GovSystem;
  label: string;
  address: AddressValue;
  phone: string;
  isOnline: boolean;
}

export const interoperabilityService = {
  getProfile: (token?: string | null) =>
    api.get<CitizenProfile>('/interoperability/profile', token),

  updateIdentity: (payload: { fullName?: string; dob?: string }, token?: string | null) =>
    api.patch<CitizenProfile>('/interoperability/profile', payload, token),

  listSystems: (token?: string | null) =>
    api.get<ConnectedSystem[]>('/interoperability/systems', token),

  updateAddress: (
    payload: { value: AddressValue; targets: GovSystem[]; consent: boolean },
    token?: string | null,
  ) => api.put<SyncResponse>('/interoperability/address', payload, token),

  updatePhone: (
    payload: { value: string; targets: GovSystem[]; consent: boolean },
    token?: string | null,
  ) => api.put<SyncResponse>('/interoperability/phone', payload, token),

  retry: (batchId: string, token?: string | null) =>
    api.post<SyncResponse>(`/interoperability/sync/${batchId}/retry`, undefined, token),

  history: (token?: string | null) =>
    api.get<SyncBatchRecord[]>('/interoperability/history', token),

  /** Demo control: take one connected system offline (or bring it back). */
  simulate: (system: GovSystem, online: boolean, token?: string | null) =>
    api.post<ConnectedSystem>(`/interoperability/systems/${system}/simulate`, { online }, token),
};
