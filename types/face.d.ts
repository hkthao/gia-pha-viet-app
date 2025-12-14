import { BaseSearchQuery } from './common';

export interface BoundingBoxDto {
  x: number;
  y: number;
  width: number;
  height: number;
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
}

export interface FaceDetectionResponseDto {
  imageId: string;
  detectedFaces: DetectedFaceDto[];
}

export interface SearchFacesQuery extends BaseSearchQuery {
  familyId?: string;
  memberId?: string;
  minConfidence?: number;
  maxConfidence?: number;
  // Add other relevant search parameters for faces
}

export interface FaceDataMappingDto {
  faceId: string;
  boundingBox: BoundingBoxDto;
  confidence: number;
  memberId?: string; // Optional, as it might not be assigned yet
}

export interface CreateFaceDataRequestDto {
  familyId: string;
  imageUrl: string;
  detectedFaces: FaceDataMappingDto[];
}
