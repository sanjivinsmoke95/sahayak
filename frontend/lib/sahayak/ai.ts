import { api } from './client';
import type { AskResponse, ChatRead, ChatWithMessages, EligibilityResponse, Lang } from './types';

export const aiService = {
  ask(payload: {
    question: string;
    lang: Lang;
    documentId?: string;
    chatId?: string;
    history?: Array<{ role: string; content: string }>;
  }, token: string) {
    return api.post<AskResponse>('/assistant/ask', payload, token);
  },

  eligibility(schemeId: string, token: string) {
    return api.get<EligibilityResponse>(`/assistant/eligibility/${schemeId}`, undefined, token);
  },

  listChats(token: string) {
    return api.get<ChatRead[]>('/chats', undefined, token);
  },

  getChat(id: string, token: string) {
    return api.get<ChatWithMessages>(`/chats/${id}`, undefined, token);
  },

  createChat(payload: { title?: string; language?: Lang; documentId?: string }, token: string) {
    return api.post<ChatRead>('/chats', payload, token);
  },
};
