import type { LanguageCode } from './i18n';

export interface AssistantCitation {
  service_name: string;
  source_url?: string | null;
  official_application_url?: string | null;
  source_type: 'official_service' | 'user_document';
  document_id?: string | null;
  department?: string | null;
  state?: string | null;
  last_updated?: string | null;
  version?: number | null;
}

export interface AssistantAnswer {
  text: string;
  /** Optional bullet list, already localised. */
  list?: string[] | null;
  /** Document ids the answer refers to, rendered as cards. */
  docRefs?: string[] | null;
  /** The assistant may switch language when asked to. */
  setLang?: LanguageCode | null;
  citations?: AssistantCitation[];
  grounded?: boolean;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  list?: string[] | null;
  docRefs?: string[] | null;
  createdAt: string;
  citations?: AssistantCitation[];
  grounded?: boolean;
}

export interface EligibilityReason {
  k: 'ok' | 'no' | 'unknown';
  t: string;
}

export interface EligibilityResult {
  verdict: 'likely' | 'maybe' | 'no';
  reasons: EligibilityReason[];
  note: string;
}

export interface EligibilityProfile {
  age: string;
  state: string;
  income: string;
  work: string;
}
