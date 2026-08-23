import type { Language, TextSize } from '@/types';

export const LANGS: Language[] = [
  { code: 'en', label: 'English',  native: 'English',  speech: 'en-IN' },
  { code: 'hi', label: 'Hindi',    native: 'हिन्दी',   speech: 'hi-IN' },
  { code: 'te', label: 'Telugu',   native: 'తెలుగు',   speech: 'te-IN' }
];

export const TEXT_SIZES: Record<TextSize, number> = { standard: 16, large: 18, xlarge: 20 };

export const DEFAULT_LANGUAGE: Language['code'] = 'en';
