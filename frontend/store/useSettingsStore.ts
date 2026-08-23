import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LANGUAGE } from '@/lib/i18n';
import type { LanguageCode, TextSize } from '@/types';

interface SettingsState {
  language: LanguageCode;
  textSize: TextSize;
  readAloud: boolean;
  autoShrink: boolean;
  displayName: string;
  setLanguage: (language: LanguageCode) => void;
  setTextSize: (textSize: TextSize) => void;
  setReadAloud: (readAloud: boolean) => void;
  setAutoShrink: (autoShrink: boolean) => void;
  setDisplayName: (displayName: string) => void;
  /** Applies settings fetched from the server without re-triggering a save. */
  hydrateFromServer: (settings: Partial<SettingsState>) => void;
}

/**
 * Preferences live on the device as well as the server, so the app opens in
 * the right language before the first request finishes.
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      textSize: 'standard',
      readAloud: false,
      autoShrink: true,
      displayName: '',
      setLanguage: (language) => set({ language }),
      setTextSize: (textSize) => set({ textSize }),
      setReadAloud: (readAloud) => set({ readAloud }),
      setAutoShrink: (autoShrink) => set({ autoShrink }),
      setDisplayName: (displayName) => set({ displayName }),
      hydrateFromServer: (settings) => set(settings),
    }),
    { name: 'sahayak.settings.v1' },
  ),
);
