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
  email: string;
  phone: string;
  setLanguage: (language: LanguageCode) => void;
  setTextSize: (textSize: TextSize) => void;
  setReadAloud: (readAloud: boolean) => void;
  setAutoShrink: (autoShrink: boolean) => void;
  setDisplayName: (displayName: string) => void;
  setContact: (contact: { displayName?: string; email?: string; phone?: string }) => void;
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
      email: '',
      phone: '',
      setLanguage: (language) => set({ language }),
      setTextSize: (textSize) => set({ textSize }),
      setReadAloud: (readAloud) => set({ readAloud }),
      setAutoShrink: (autoShrink) => set({ autoShrink }),
      setDisplayName: (displayName) => set({ displayName }),
      setContact: (contact) => set(contact),
      hydrateFromServer: (settings) => set(settings),
    }),
    {
      name: 'sahayak.settings.v1',
      // Hydrate from localStorage only after mount (see StoreHydrator). Reading
      // it synchronously at store creation makes the first client render differ
      // from the server's default and trips React's hydration check on every
      // page that shows the language or the user's name.
      skipHydration: true,
      // An explicit allowlist rather than the whole state. Without it, any
      // field added to this store later would be written to localStorage by
      // default — which is precisely how an identity number ends up on disk.
      // Adding a key here should be a deliberate decision.
      partialize: (state) => ({
        language: state.language,
        textSize: state.textSize,
        readAloud: state.readAloud,
        autoShrink: state.autoShrink,
        displayName: state.displayName,
        email: state.email,
        phone: state.phone,
      }),
    },
  ),
);
