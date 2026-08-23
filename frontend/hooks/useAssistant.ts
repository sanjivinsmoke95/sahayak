'use client';

import { useMutation } from '@tanstack/react-query';
import { assistantService } from '@/services';
import { useChatStore, useSettingsStore, useWorkspaceStore } from '@/store';
import type { AssistantAnswer, EligibilityProfile } from '@/types';
import { useAuthToken } from './useAuthToken';

/** Sends a question to FastAPI and appends both turns to the thread. */
export function useAskAssistant() {
  const getToken = useAuthToken();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const activeDocumentId = useWorkspaceStore((s) => s.activeDocumentId);
  const activeModelId = useWorkspaceStore((s) => s.activeModelId);
  const { addMessage, setPending } = useChatStore();

  return useMutation<AssistantAnswer, Error, string>({
    mutationFn: async (question) => {
      setPending(true);
      return assistantService.ask(
        { question, lang: language, documentId: activeDocumentId, modelId: activeModelId },
        await getToken(),
      );
    },
    onMutate: (question) => {
      addMessage({
        id: `u-${Date.now()}`,
        role: 'user',
        text: question,
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: (answer) => {
      addMessage({
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: answer.text,
        list: answer.list,
        docRefs: answer.docRefs,
        createdAt: new Date().toISOString(),
      });
      // The assistant honours "explain this in Telugu" by switching the app.
      if (answer.setLang) setLanguage(answer.setLang);
    },
    onSettled: () => setPending(false),
  });
}

export function useCheckEligibility() {
  const getToken = useAuthToken();
  const language = useSettingsStore((s) => s.language);

  return useMutation({
    mutationFn: async (payload: { documentId: string; profile: EligibilityProfile }) =>
      assistantService.checkEligibility(
        { documentId: payload.documentId, lang: language, profile: payload.profile },
        await getToken(),
      ),
  });
}
