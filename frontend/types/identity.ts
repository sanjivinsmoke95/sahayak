export type IdentityKind = 'aadhaar' | 'pan';

/**
 * What the app holds about an identity number in the ordinary case.
 *
 * There is no `value` field by design: the plaintext arrives only as the
 * result of an explicit reveal call and is held in component state for a few
 * seconds, never in a store, a cache or the record itself.
 */
export interface IdentityRecord {
  kind: IdentityKind;
  masked: string;
  updatedAt?: string | null;
}

export interface IdentityAuditEntry {
  kind: IdentityKind;
  action: 'created' | 'updated' | 'viewed' | 'deleted' | 'denied';
  success: boolean;
  at: string;
}
