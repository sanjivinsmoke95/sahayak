'use client';

import { useCallback } from 'react';
import { T } from '@/lib/i18n';
import type { StringKey } from '@/lib/i18n';
import { useSettingsStore } from '@/store';
import { pick } from '@/types';
import type { Localized } from '@/types';

/**
 * The only way components should read copy.
 *
 * `t` looks up a key in the interface dictionary; `tr` localises a value that
 * came from data (a document title, an AI answer) rather than the dictionary.
 */
export function useTranslation() {
  const language = useSettingsStore((s) => s.language);

  const t = useCallback((key: StringKey) => pick(T[key] as Localized, language), [language]);
  const tr = useCallback((value: Localized | undefined) => pick(value, language), [language]);

  return { t, tr, language };
}
