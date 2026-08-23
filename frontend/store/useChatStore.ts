import { create } from 'zustand';
import type { AssistantMessage } from '@/types';

interface ChatState {
  /** Kept in memory so the thread survives navigation within a session. */
  messages: AssistantMessage[];
  pending: boolean;
  addMessage: (message: AssistantMessage) => void;
  setPending: (pending: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  pending: false,
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setPending: (pending) => set({ pending }),
  reset: () => set({ messages: [], pending: false }),
}));
