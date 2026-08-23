import { create } from 'zustand';

type NavDirection = 'push' | 'pop' | 'tab';

interface UiState {
  /** Drives the slide direction of the screen transition. */
  direction: NavDirection;
  languageSheetOpen: boolean;
  splashDone: boolean;
  offline: boolean;
  setDirection: (direction: NavDirection) => void;
  setLanguageSheetOpen: (open: boolean) => void;
  setSplashDone: (done: boolean) => void;
  setOffline: (offline: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  direction: 'tab',
  languageSheetOpen: false,
  splashDone: false,
  offline: false,
  setDirection: (direction) => set({ direction }),
  setLanguageSheetOpen: (languageSheetOpen) => set({ languageSheetOpen }),
  setSplashDone: (splashDone) => set({ splashDone }),
  setOffline: (offline) => set({ offline }),
}));
