/**
 * Chat service — PLACEHOLDER integration for POST /chat.
 *
 * The chat UI is not redesigned. This only wires a typed call so the assistant
 * can be connected when the backend /chat endpoint is available. If the endpoint
 * is missing (404), callers should fall back to their existing behaviour.
 */
import type { ChatRequest, ChatResponse } from '@/types';
import { apiClient, unwrap } from './client';

export const chatApi = {
  send: (payload: ChatRequest) =>
    unwrap<ChatResponse>(apiClient.post('/services/chat', payload)),
};
