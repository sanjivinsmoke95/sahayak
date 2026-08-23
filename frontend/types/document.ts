import type { Localized } from './i18n';

export type DocumentCategory =
  | 'pension' | 'scheme' | 'tax' | 'identity' | 'property' | 'education' | 'other';

export type DocumentStatus = 'action' | 'done' | 'info';

/** Conditions printed in the notice, used by the eligibility checker. */
export interface EligibilityRules {
  minAge?: number;
  maxAge?: number;
  maxIncome?: number;
  work?: string[];
  note: Localized;
}

/**
 * The official wording, kept in the language it was printed in. This is not
 * translated on purpose — it is what the reader must quote at the counter.
 */
export interface GovernmentWording {
  what: string;
  why: string;
  doIt: string;
  where: string;
}

/** One line of officialese beside what it actually means. */
export interface JargonPair {
  gov: string;
  simple: Localized;
}

/**
 * A structured personal field read from the reader's own document. Sensitive
 * identifiers (PAN, Aadhaar) are masked for display and only revealed when the
 * owner chooses to; the value is never logged or placed in a URL.
 */
export interface PersonalField {
  /** Which detail this is, e.g. "Name", "PAN number". */
  label: Localized;
  /** The value as read from the document. */
  value: string;
  /** True for identifiers that stay masked until the reader reveals them. */
  sensitive: boolean;
}

/**
 * The shape the AI layer returns for an analysed document. The sample
 * documents and the real analysis endpoint both produce this.
 */
export interface SahayakDocument {
  id: string;
  cat: DocumentCategory;
  /** Sample documents are seeded into a new account. */
  seeded?: boolean;
  status: DocumentStatus;
  title: Localized;
  issuer: Localized;
  /** Reference number printed on the notice. */
  refNo: string;
  received: string;
  /** ISO date, or null when the notice carries no deadline. */
  deadline: string | null;
  what: Localized;
  why: Localized;
  steps: Localized[];
  need: Localized[];
  /** Which requirements are already satisfied, index-aligned with `need`. */
  needDone?: boolean[];
  where: Localized;
  ifNot: Localized;
  /** The whole notice in one calm paragraph. */
  explain: Localized;
  gov: GovernmentWording;
  /** The notice reproduced verbatim, in its printed language. */
  original: string;
  pairs: JargonPair[];
  elig?: EligibilityRules | null;
  /** Structured personal details read from the document; sensitive ones masked. */
  personal?: PersonalField[];
  /** Detected document type, e.g. "PAN Card"; empty when unsure. */
  docType?: string;
  /** Whether this looks like a government document at all. */
  isGovernment?: boolean;
  /** Classification confidence, 0–1. */
  confidence?: number;
  /** The original uploaded file, when one exists (null for samples). */
  originalFile?: { name: string; mime: string } | null;
  /** The person/profile this document belongs to, when assigned. */
  profileId?: string | null;
}

/** Per-document tick marks. Keys are indexes into `steps` / `need`. */
export interface Checklist {
  steps: Record<number, boolean>;
  need: Record<number, boolean>;
}

export type ChecklistMap = Record<string, Checklist>;
