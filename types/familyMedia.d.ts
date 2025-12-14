// gia-pha-viet-app/types/familyMedia.d.ts
import { BaseSearchQuery } from './common';

export interface FamilyMediaDto {
  id: string; // Assuming an ID for the media entity
  familyId: string;
  fileName: string;
  filePath: string; // URL or path to storage
  mediaType?: string;
  fileSize: number; // in bytes
  description?: string;
  thumbnailPath?: string; // For images/videos
  uploadedBy?: string; // User who uploaded the file
  uploadedById?: string; // Assuming an ID for the user
  uploadedAt: string; // ISO date string
}

export interface FamilyMediaSearchQuery extends BaseSearchQuery {
  familyId?: string;
  mediaType?: string;
  folder?: string;
  fileName?: string;
}
