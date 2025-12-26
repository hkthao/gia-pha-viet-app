// gia-pha-viet-app/hooks/chat/aiChat.adapters.ts

import { chatService } from '@/services'; // Import the actual chat service
import { ImageUploadResultDto, ChatInputRequest } from '@/types'; // Import ImageUploadResultDto and ChatInputRequest

// --- AI Chat Service Adapter ---
export interface AIChatServiceAdapter {
  /**
   * Sends a chat message to the AI service and gets a response.
   * @param request The ChatInputRequest object containing message, session ID, family ID, etc.
   * @returns A Promise resolving to the AI's response text.
   */
  sendMessage(request: ChatInputRequest): Promise<string>;

  /**
   * Uploads an image file.
   * @param uri The URI of the image file.
   * @param fileName The name of the file.
   * @param expiration Optional: Image expiration in seconds.
   * @returns A Promise resolving to the ImageUploadResultDto.
   */
  uploadImage(uri: string, fileName: string, expiration?: number): Promise<ImageUploadResultDto>;
}

export const defaultAIChatServiceAdapter: AIChatServiceAdapter = {
  sendMessage: async (request: ChatInputRequest) => {
    return chatService.sendMessage(request);
  },

  uploadImage: async (uri: string, fileName: string, expiration?: number) => {
    return chatService.uploadImage(uri, fileName, expiration);
  },
};
