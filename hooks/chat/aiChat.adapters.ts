// gia-pha-viet-app/hooks/chat/aiChat.adapters.ts

import { chatService } from '@/services'; // Import the actual chat service



// --- AI Chat Service Adapter ---
export interface AIChatServiceAdapter {
  /**
   * Interacts with an actual AI service to get a response.
   * @param userMessage The message sent by the user.
   * @param sessionId The current chat session ID.
   * @param familyId The ID of the family context.
   * @returns A Promise resolving to the AI's response text.
   */
  getAIResponse(userMessage: string, sessionId: string, familyId: string): Promise<string>;
}

export const defaultAIChatServiceAdapter: AIChatServiceAdapter = {
  getAIResponse: async (userMessage: string, sessionId: string, familyId: string) => {
    return chatService.getAIResponse(userMessage, sessionId, familyId);
  },
};
