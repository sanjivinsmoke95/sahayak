import { api } from '@/lib/api-client';

export interface AiModel {
  id: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'rule-based';
  modelKey: string;
  displayName: string;
  isDefault: boolean;
  isAvailable: boolean;
}

export const aiModelsService = {
  list: (token?: string | null) => api.get<AiModel[]>('/ai-models', token),
};
