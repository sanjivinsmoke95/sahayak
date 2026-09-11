import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceState {
  /** Document currently open, so the assistant knows what "this" means. */
  activeDocumentId: string | null;
  /** Which AI model the user picked, mirrored from /api/ai-models. */
  activeModelId: string | null;
  setActiveDocumentId: (id: string | null) => void;
  setActiveModelId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeDocumentId: null,
      activeModelId: null,
      setActiveDocumentId: (activeDocumentId) => set({ activeDocumentId }),
      setActiveModelId: (activeModelId) => set({ activeModelId }),
    }),
    {
      name: 'sahayak.workspace.v1',
      // Deferred to after mount (see StoreHydrator) so the persisted ids do not
      // make the first client render differ from the server and trip hydration.
      skipHydration: true,
      // Allowlisted for the same reason as the settings store: only these two
      // ids should ever reach localStorage from here.
      partialize: (state) => ({
        activeDocumentId: state.activeDocumentId,
        activeModelId: state.activeModelId,
      }),
    },
  ),
);
