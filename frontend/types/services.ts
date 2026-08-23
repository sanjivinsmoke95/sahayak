import type { Localized } from './i18n';

/**
 * A curated, data-driven citizen-service entry for the on-device directory.
 * This is the reusable shape behind the government-services cards — add a new
 * service by adding one object, in all three languages. The required-document
 * lists are general guidance; each card reminds the reader to confirm the exact
 * requirements at the office, in keeping with the rest of the app.
 */
export interface CitizenService {
  id: string;
  icon: string;
  title: Localized;
  /** One line: who this service is for. */
  forWhom: Localized;
  /** Commonly required documents. */
  documents: Localized[];
  /** The steps to apply, in order. */
  steps: Localized[];
  /** Where to apply. */
  where: Localized;
  /** A deadline note, or null when the service has no fixed date. */
  deadline?: Localized | null;
  /** Whether a Mee Seva centre is a typical place to complete this. */
  meeSeva?: boolean;
}

/** A nearby Mee Seva centre from the backend Places proxy. */
export interface MeeSevaCentre {
  name: string;
  address: string;
  lat: number;
  lng: number;
  openNow?: boolean | null;
  rating?: number | null;
  distanceKm: number;
}

/** GET /places/mee-seva */
export interface MeeSevaResponse {
  enabled: boolean;
  error?: string;
  results: MeeSevaCentre[];
}

/** GET /places/config */
export interface MapsConfig {
  enabled: boolean;
  browserKey: string | null;
}

/**
 * Government-service types — mirror the collector API responses exactly
 * (GET /services, /services/{id}, /services/{id}/history, /search, /stats, /health).
 * No `any`; every backend field is typed.
 */

export interface GovServiceForm {
  title: string | null;
  url: string;
}

export interface GovServiceFAQ {
  question: string;
  answer: string;
}

export interface GovServiceContact {
  department?: string | null;
  phone?: string[];
  email?: string[];
  address?: string | null;
  website?: string | null;
}

/** One government service (collector `ServiceOut`). */
export interface GovService {
  id: number;
  service_name: string;
  department: string | null;
  state: string | null;
  district: string | null;
  language: string | null;
  description: string | null;
  eligibility: string[];
  required_documents: string[];
  application_steps: string[];
  fees: string | null;
  processing_time: string | null;
  official_application_url: string | null;
  official_notification_url: string | null;
  forms: GovServiceForm[];
  faq: GovServiceFAQ[];
  contact: GovServiceContact;
  version: number;
  last_updated: string | null;
  source_url: string | null;
}

/** A search hit adds a relevance score (collector `ServiceHit`). */
export interface GovServiceHit extends GovService {
  score: number;
}

export type SearchMode = 'keyword' | 'semantic' | 'hybrid';

/** GET /search */
export interface GovSearchResponse {
  query: string;
  mode: SearchMode;
  count: number;
  results: GovServiceHit[];
}

/** GET /services (paginated) */
export interface PaginatedServices {
  total: number;
  limit: number;
  offset: number;
  results: GovService[];
}

/** GET /services/{id}/history */
export interface GovServiceVersion {
  version: number;
  content_hash: string | null;
  captured_at: string | null;
  snapshot: Record<string, unknown>;
}

/** GET /stats */
export interface GovStats {
  total_services: number;
  by_state: Record<string, number>;
  by_language: Record<string, number>;
}

/** GET /health */
export interface GovHealth {
  status: string;
  search_mode?: string;
  embedding_model?: string;
}

/** POST /crawl */
export interface CrawlResponse {
  status: string;
  sources: string[] | string | null;
}

/** POST /chat (placeholder integration; backend endpoint prepared separately). */
export interface ChatRequest {
  question: string;
  lang?: string;
  state?: string;
  top_k?: number;
}

export interface ChatCitation {
  service_name: string;
  source_url?: string | null;
  official_application_url?: string | null;
}

export interface ChatResponse {
  answer: string;
  grounded: boolean;
  citations?: ChatCitation[];
  used_services?: GovServiceHit[];
}

/** Query params for listing / searching. */
export interface ServiceListParams {
  state?: string;
  department?: string;
  language?: string;
  limit?: number;
  offset?: number;
}

export interface ServiceSearchParams {
  q: string;
  mode?: SearchMode;
  limit?: number;
  state?: string;
  department?: string;
  language?: string;
}

/** Back-compat alias (previous name used by services/gov-services.service.ts). */
export type GovServiceSearchResponse = GovSearchResponse;
