import type { LanguageCode } from './i18n';

export interface AssistantAnswer {
  text: string;
  /** Optional bullet list, already localised. */
  list?: string[] | null;
  /** Document ids the answer refers to, rendered as cards. */
  docRefs?: string[] | null;
  /** The assistant may switch language when asked to. */
  setLang?: LanguageCode | null;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  list?: string[] | null;
  docRefs?: string[] | null;
  createdAt: string;
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
