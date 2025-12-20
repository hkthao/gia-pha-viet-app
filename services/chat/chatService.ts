// gia-pha-viet-app/services/chat/chatService.ts

import { ApiClientMethods } from '@/types/apiClient';
import { Result, ChatWithAssistantCommand, ChatResponse } from '@/types/api.d';
import { AIChatServiceAdapter } from '@/hooks/chat/aiChat.adapters'; // Correct import path for AIChatServiceAdapter

export interface IChatService extends AIChatServiceAdapter { }

export class ApiChatService implements IChatService {
  private baseEndpoint: string = '/api/ai/chat';

  constructor(private apiClient: ApiClientMethods) {}

  async getAIResponse(userMessage: string, sessionId: string, familyId: string): Promise<string> {
    const command: ChatWithAssistantCommand = {
      sessionId: sessionId,
      chatInput: userMessage,
      metadata: { familyId: familyId },
    };

    const response = await this.apiClient.post<Result<ChatResponse>>(this.baseEndpoint, command);

    if (response.isSuccess && response.value) {
      return response.value.output;
    } else {
      throw new Error(response.error?.message || 'Failed to get AI response');
    }
  }
}
