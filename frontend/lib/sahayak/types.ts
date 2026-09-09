// ─── Shared primitives ──────────────────────────────────────────────
export type Lang = 'en' | 'hi' | 'te';
export type Localized = { en: string; hi: string; te: string };
export type LocalizedList = { en: string[]; hi: string[]; te: string[] };

// ─── Auth ────────────────────────────────────────────────────────────
export interface UserRead {
  id: string;
  clerk_id: string;
  email: string | null;
  display_name: string;
}

// ─── Files ───────────────────────────────────────────────────────────
export interface FileRead {
  id: string;
  documentId: string | null;
  name: string;
  mimeType: string;
  sizeBytes: number;
  originalSizeBytes: number | null;
  storagePath: string;
  url: string | null;
  createdAt: string;
}

// ─── Documents ───────────────────────────────────────────────────────
export type DocStatus = 'pending' | 'processing' | 'done' | 'error';

export interface DocumentRead {
  id: string;
  cat: string | null;
  status: DocStatus;
  seeded: boolean;
  title: Localized | null;
  issuer: Localized | null;
  refNo: string | null;
  received: string | null;
  deadline: string | null;
  what: Localized | null;
  why: Localized | null;
  steps: LocalizedList | null;
  need: LocalizedList | null;
  needDone: boolean[] | null;
  where: Localized | null;
  ifNot: Localized | null;
  explain: Localized | null;
  gov: string[] | null;
  pairs: Array<{ q: Localized; a: Localized }> | null;
  elig: Localized | null;
  personal: Record<string, string> | null;
  docType: string | null;
  isGovernment: boolean | null;
  confidence: number | null;
  profileId: string | null;
  originalFile?: { name: string; mime: string } | null;
}

// ─── AI / Chat ───────────────────────────────────────────────────────
export interface GovChatCitation {
  title: string;
  url: string;
}

export interface AskResponse {
  text: string;
  list: string[] | null;
  docRefs: string[] | null;
  setLang: Lang | null;
  citations: GovChatCitation[];
  grounded: boolean;
}

export interface EligibilityResponse {
  verdict: 'likely' | 'maybe' | 'no';
  reasons: Array<{ k: 'ok' | 'no' | 'unknown'; t: string }>;
  note: string;
}

export interface ChatRead {
  id: string;
  title: string | null;
  language: Lang;
  document_id: string | null;
  created_at: string;
}

export interface MessageRead {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  bullet_list: string[] | null;
  document_refs: string[] | null;
  created_at: string;
}

export interface ChatWithMessages extends ChatRead {
  messages: MessageRead[];
}

// ─── Schemes ─────────────────────────────────────────────────────────
export interface SchemeSummary {
  id: string;
  name: string;
  category: string;
  level: string;
  benefit: string;
  source: string;
  status: string;
}

export interface SchemeRead extends SchemeSummary {
  summary: string;
  categories: string[];
  requiredDocuments: string[];
  requirementTags: string[];
  tags: string[];
  officialUrl: string | null;
  sourceType: string | null;
}

export interface SchemeMatch extends SchemeSummary {
  satisfied: number;
  total: number;
  matchedTags: string[];
  missingTags: string[];
}

// ─── Government Services ─────────────────────────────────────────────
export interface GovService {
  id: number;
  service_name: string;
  department: string;
  state: string;
  district: string | null;
  language: string;
  description: string;
  eligibility: string[];
  required_documents: string[];
  application_steps: string[];
  fees: string | null;
  processing_time: string | null;
  official_application_url: string | null;
  forms: string[];
  faq: Array<{ q: string; a: string }>;
  contact: Record<string, string> | null;
  version: number;
  last_updated: string;
  source_url: string | null;
}

export interface GovChatResponse {
  answer: string;
  grounded: boolean;
  citations: GovChatCitation[];
  used_services: Array<{ id: number; name: string; score: number }>;
}

// ─── Places ──────────────────────────────────────────────────────────
export interface Place {
  name: string;
  address: string;
  lat: number;
  lng: number;
  openNow: boolean | null;
  rating: number | null;
  distanceKm: number;
}

// ─── Intelligence ────────────────────────────────────────────────────
export interface ValidityRead {
  issueDate: string | null;
  expiryDate: string | null;
  status: 'valid' | 'expiring' | 'expired' | 'unknown';
  daysLeft: number | null;
  source: string;
  confidence: number;
}

export interface RejectionRead {
  isRejection: boolean;
  reasonStated: string | null;
  reason: Localized | null;
  relatedDocuments: string[];
  suggestedActions: Localized | null;
  appeal: { phones: string[]; emails: string[]; urls: string[] };
  confidence: number;
}

export interface ReadinessRead {
  serviceId: string;
  status: 'ready' | 'almost_ready' | 'needs_confirmation' | 'not_ready';
  score: number;
  satisfied: number;
  total: number;
  requirements: Array<{ name: string; satisfied: boolean; confidence: string }>;
}

// ─── Settings ────────────────────────────────────────────────────────
export interface SettingsRead {
  language: Lang;
  textSize: 'standard' | 'large' | 'xlarge';
  readAloud: boolean;
  autoShrink: boolean;
  displayName: string | null;
}

// ─── Profiles ────────────────────────────────────────────────────────
export interface ProfileRead {
  id: string;
  name: string;
  relationship: string;
  isSelf: boolean;
}

// ─── Applications ────────────────────────────────────────────────────
export interface ApplicationRead {
  id: string;
  serviceId: string;
  status: string;
  notes: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
