import { create } from 'zustand';
import type { AssistantMessage } from '@/types';

interface ChatState {
  /** Kept in memory so the thread survives navigation within a session. */
  messages: AssistantMessage[];
  pending: boolean;
  addMessage: (message: AssistantMessage) => void;
  replaceMessage: (id: string, patch: Partial<AssistantMessage>) => void;
  setPending: (pending: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  pending: false,
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  replaceMessage: (id, patch) =>
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
  setPending: (pending) => set({ pending }),
  reset: () => set({ messages: [], pending: false }),
}));
