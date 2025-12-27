import { BaseSearchQuery } from './common';

export interface BoundingBoxDto {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum FaceStatus {
  Recognized = 'recognized',
  Unrecognized = 'unrecognized',
  NewlyLabeled = 'newly-labeled',
  OriginalRecognized = 'original-recognized',
}

export interface DetectedFaceDto {
  id: string;
  boundingBox: BoundingBoxDto;
  confidence: number;
  thumbnail?: string;
  thumbnailUrl?: string;
  embedding?: number[];
  memberId?: string;
  memberName?: string;
  familyId?: string;
  familyName?: string;
  birthYear?: number;
  deathYear?: number;
  familyAvatarUrl?: string;
  memberAvatarUrl?: string;
  status?: FaceStatus; // New status field
  emotion?: string;
  emotionConfidence?: number;
  faceId?: string;
}

export interface FaceDetectionResponseDto {
  imageId: string;
  originalImageUrl?: string;
  detectedFaces: DetectedFaceDto[];
}

export interface SearchFacesQuery extends BaseSearchQuery {
  familyId?: string;
  memberId?: string;
  minConfidence?: number;
  maxConfidence?: number;
  // Add other relevant search parameters for faces
}

export interface CreateFaceDataRequestDto {
  familyId: string;
  imageUrl: string;
  faceId: string;
  boundingBox: BoundingBoxDto;
  embedding?: number[];
  confidence: number;
  memberId?: string; // Optional, as it might not be assigned yet
  originalImageUri?: string; // For client-side tracking of original image source
  thumbnailUrl?: string; // URL for the uploaded face crop
}
