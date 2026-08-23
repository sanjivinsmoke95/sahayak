/** A string that exists in all three supported languages. */
export interface Localized {
  en: string;
  hi: string;
  te: string;
}

export type LanguageCode = 'en' | 'hi' | 'te';

export interface Language {
  code: LanguageCode;
  /** English name, for accessibility labels. */
  label: string;
  /** The name written in that language, for the language picker. */
  native: string;
  /** BCP-47 tag handed to the speech synthesiser. */
  speech: string;
}

export type TextSize = 'standard' | 'large' | 'xlarge';

/** Builds a Localized value. Kept terse because the dictionaries are long. */
export const L = (en: string, hi: string, te: string): Localized => ({ en, hi, te });

export const pick = (value: Localized | undefined, lang: LanguageCode): string =>
  value ? value[lang] || value.en : '';
