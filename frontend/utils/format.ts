import { KB, MB, SLOW_LINK_BPS } from '@/lib/constants';
import type { LanguageCode } from '@/types';

export const humanBytes = (n: number | null | undefined): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  if (n < KB) return `${n} B`;
  if (n < MB) return `${n / KB < 10 ? (n / KB).toFixed(1) : Math.round(n / KB)} KB`;
  return `${(n / MB).toFixed(n / MB < 10 ? 2 : 1)} MB`;
};

/** How long this many bytes take on a weak rural connection. */
export const transferSeconds = (bytes: number): number =>
  Math.max(1, Math.round(bytes / SLOW_LINK_BPS));

/** True only for a parseable ISO date string like "2026-09-30". */
export const isValidIsoDate = (iso: string | null | undefined): iso is string => {
  if (!iso) return false;
  const time = new Date(`${iso}T00:00:00`).getTime();
  return !Number.isNaN(time);
};

export const daysUntil = (iso: string): number => {
  const target = new Date(`${iso}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
};

export type Urgency = 'past' | 'red' | 'amber' | 'green';

export const urgency = (days: number): Urgency =>
  days < 0 ? 'past' : days <= 14 ? 'red' : days <= 45 ? 'amber' : 'green';

/**
 * A localised date, or an empty string when the value is missing or unparseable.
 * Returning '' (never the literal "Invalid Date") lets callers hide the row
 * instead of showing a broken date to a nervous reader.
 */
export const formatDate = (iso: string | null | undefined, lang: LanguageCode): string => {
  if (!isValidIsoDate(iso)) return '';
  const locale = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
  try {
    const formatted = new Date(`${iso}T00:00:00`).toLocaleDateString(locale, {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    return formatted === 'Invalid Date' ? '' : formatted;
  } catch {
    return '';
  }
};

/** Replaces {name} placeholders in a localised template. */
export const fill = (template: string, values: Record<string, string | number>): string =>
  Object.keys(values).reduce(
    (acc, key) => acc.split(`{${key}}`).join(String(values[key])),
    template,
  );

export const renameFile = (name: string, suffix: string, ext?: string): string => {
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  return stem + suffix + (ext ? `.${ext}` : dot > 0 ? name.slice(dot) : '');
};

export const isImageFile = (file: File | null | undefined): boolean =>
  !!file && /^image\//.test(file.type || '');

/** Short haptic tap. Silently ignored where unsupported. */
export const buzz = (ms = 8): void => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* not supported */
  }
};
