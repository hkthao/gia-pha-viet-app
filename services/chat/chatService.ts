// gia-pha-viet-app/services/chat/chatService.ts

import { ApiClientMethods } from '@/types/apiClient';
import { ChatInputRequest, ChatResponse, ImageUploadResultDto } from '@/types'; // Import ImageUploadResultDto
import { AIChatServiceAdapter } from '@/hooks/chat/aiChat.adapters'; // Correct import path for AIChatServiceAdapter
import { Platform } from 'react-native'; // Import Platform

export type IChatService = AIChatServiceAdapter

export class ApiChatService implements IChatService {
  private baseEndpoint: string = '/ai/chat';
  private fileUploadEndpoint: string = '/files/upload-image'; // New endpoint for file uploads

  constructor(private apiClient: ApiClientMethods) {}

  async sendMessage(request: ChatInputRequest): Promise<string> {
    try {
      const response = await this.apiClient.post<ChatResponse>(this.baseEndpoint, request);
      if (response.output === undefined) {
        throw new Error('AI response output is undefined.');
      }
      return response.output;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy phản hồi từ AI. Vui lòng thử lại sau.';
      throw new Error(errorMessage);
    }
  }

  async uploadImage(uri: string, fileName: string, expiration?: number): Promise<ImageUploadResultDto> {
    const formData = new FormData();
    formData.append('File', {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: fileName,
      type: 'image/jpeg', // Assuming JPEG for simplicity, can be dynamic
    } as any); // Type assertion as FormData.append might not fully support RN file structure natively

    formData.append('FileName', fileName);
    if (expiration !== undefined) {
      formData.append('Expiration', expiration.toString());
    }

    try {
      // Assuming the apiClient can handle FormData and sets appropriate headers (e.g., Content-Type: multipart/form-data)
      const response = await this.apiClient.post<ImageUploadResultDto>(this.fileUploadEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tải ảnh lên. Vui lòng thử lại sau.';
      throw new Error(errorMessage);
    }
  }
}
