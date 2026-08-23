export type ValidityStatus = 'valid' | 'expiring' | 'expired' | 'unknown';

export interface DocumentValidity {
  issueDate: string | null;
  expiryDate: string | null;
  status: ValidityStatus;
  daysLeft: number | null;
  source: string;
  confidence: number;
}

export interface ConsistencyIssue {
  type: string;
  severity: 'info' | 'warning' | 'high';
  documents: string[];
  documentTitles: string[];
  values: string[];
  field: string;
}

export interface ConsistencyResult {
  issues: ConsistencyIssue[];
}

export type RequirementStatus = 'satisfied' | 'missing' | 'expired' | 'unknown';
export type ReadinessStatus = 'ready' | 'almost_ready' | 'needs_confirmation' | 'not_ready';

export interface RequirementReadiness {
  index: number;
  label: string;
  status: RequirementStatus;
  matchedDocumentId: string | null;
  matchedDocType: string | null;
  reason: string;
  confidence: number;
}

export interface Readiness {
  serviceId: string;
  status: ReadinessStatus;
  score: number;
  satisfied: number;
  total: number;
  requirements: RequirementReadiness[];
}

export interface DiscoveryService {
  serviceId: string;
  status: 'ready' | 'likely_relevant';
  score: number;
  satisfied: number;
  total: number;
  missingCount: number;
}

export interface DiscoveryResult {
  services: DiscoveryService[];
}
