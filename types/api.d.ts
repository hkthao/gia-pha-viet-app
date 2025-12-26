import { MemberDto, EventDto, FamilyLocationDto } from '@/types'; // Import required DTOs
import { FaceDetectionResponseDto } from '@/types/face'; // Import FaceDetectionResponseDto from face.d.ts

// Represents a generic API error structure
export interface ApiError {
  message: string;
  code?: string;
  details?: string[];
  statusCode?: number;
}

// Represents the result of an operation that can either succeed or fail
export interface Result<T> {
  isSuccess: boolean;
  value?: T;
  error?: ApiError;
}

// Placeholder for ChatAttachmentDto based on usage in ChatInputRequest
export interface ChatAttachmentDto {
  url: string;
  contentType: string; // e.g., 'image/jpeg', 'application/pdf'
  fileName?: string;
  fileSize?: number;
}

export interface ChatLocationDto {
  latitude: number;
  longitude: number;
  address?: string;
  source?: string;
}

export interface ChatInputRequest {
  familyId: string; // Guid maps to string
  sessionId: string;
  chatInput: string;
  metadata?: { [key: string]: any }; // IDictionary maps to dictionary
  attachments?: ChatAttachmentDto[];
  location?: ChatLocationDto;
}

export interface CombinedAiContentDto {
  members?: MemberDto[];
  events?: EventDto[];
  locations?: FamilyLocationDto[];
}

export interface ChatResponse {
  output?: string;
  generatedData?: CombinedAiContentDto;
  intent?: string;
  faceDetectionResults?: FaceDetectionResponseDto[];
}

export interface ImageUploadResultDto {
    id?: string;
    title?: string;
    url?: string;
    deleteUrl?: string;
    mimeType?: string;
    size: number;
    width: number;
    height: number;
}
