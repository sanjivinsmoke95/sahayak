import { api } from '@/lib/api-client';
import type { IdentityAuditEntry, IdentityKind, IdentityRecord } from '@/types';

/**
 * Aadhaar / PAN.
 *
 * `list` returns masked values only — the plaintext exists client-side solely
 * as the return value of `reveal`, which is deliberately not cached anywhere.
 * Nothing here writes to localStorage, sessionStorage or a cookie.
 */
export const identityService = {
  list: (token?: string | null) => api.get<IdentityRecord[]>('/identity', token),

  save: (kind: IdentityKind, value: string, token?: string | null) =>
    api.put<IdentityRecord>(`/identity/${kind}`, { value }, token),

  /** POST, so the value can never appear in a URL, history entry or proxy log. */
  reveal: (kind: IdentityKind, token?: string | null) =>
    api.post<{ kind: IdentityKind; value: string }>(`/identity/${kind}/reveal`, undefined, token),

  remove: (kind: IdentityKind, token?: string | null) =>
    api.delete<void>(`/identity/${kind}`, token),

  audit: (token?: string | null) => api.get<IdentityAuditEntry[]>('/identity/audit', token),
};
