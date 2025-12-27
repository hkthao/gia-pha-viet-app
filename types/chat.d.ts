// gia-pha-viet-app/types/chat.d.ts

import type { DetectedFaceDto, FaceDetectionResponseDto } from './face'
import type { MemberDto } from './member'
import type { EventDto } from './event'
import type { FamilyLocationDto } from './familyLocation'
export interface ChatAttachmentDto {
  url: string;
  contentType: string; // e.g., 'image/jpeg', 'application/pdf'
  fileName?: string;
  fileSize?: number;
  width?: number;  // Add this
  height?: number; // Add this
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
  faceDetectionResults?: DetectedFaceDto[]; // Changed to DetectedFaceDto[]
  // analyzedImageUri?: string; // Removed this line
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

interface IUser {
  _id: string | number;
  name?: string;
  avatar?: string | number | any;
}

export interface IMessage {
  _id: string | number;
  text: string;
  createdAt: Date | number;
  user: IUser;
  attachments?: ChatAttachmentDto[]; // New: Array of attached files
  location?: ChatLocationDto | null; // Allow null for location data
  generatedData?: CombinedAiContentDto;
  intent?: string;
  faceDetectionResults?: FaceDetectionResponseDto[]; // Changed to DetectedFaceDto[]
}
