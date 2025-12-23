// gia-pha-viet-app/services/chat/chatService.ts

import { ApiClientMethods } from '@/types/apiClient';
import { ChatInputRequest, ChatResponse } from '@/types/api.d';
import { AIChatServiceAdapter } from '@/hooks/chat/aiChat.adapters'; // Correct import path for AIChatServiceAdapter

export type IChatService = AIChatServiceAdapter

export class ApiChatService implements IChatService {
  private baseEndpoint: string = '/ai/chat';

  constructor(private apiClient: ApiClientMethods) {}

  async getAIResponse(userMessage: string, sessionId: string, familyId: string): Promise<string> {
    const command: ChatInputRequest = {
      sessionId: sessionId,
      chatInput: userMessage,
      familyId:familyId,
    };

    try {
      const response = await this.apiClient.post<ChatResponse>(this.baseEndpoint, command);
      return response.output;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy phản hồi từ AI. Vui lòng thử lại sau.';
      throw new Error(errorMessage);
    }
  }
}
