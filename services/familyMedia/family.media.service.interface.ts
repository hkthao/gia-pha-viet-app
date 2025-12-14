// gia-pha-viet-app/services/familyMedia/family.media.service.interface.ts
import { Result } from '@/types';
import { IGenericService } from '@/services/base/generic.service.interface'; // Import IGenericService
import { FamilyMediaDto, FamilyMediaSearchQuery } from '@/types/familyMedia.d'; // Import FamilyMediaDto and FamilyMediaSearchQuery

export interface CreateFamilyMediaRequest {
  familyId: string;
  file: string; // The uploaded file as base64 string
  fileName: string; // The name of the file
  mediaType?: string; // e.g., "image/jpeg", "image/png"
  description?: string;
  folder?: string; // Folder within storage (e.g., "photos", "videos")
}

export interface IFamilyMediaService extends IGenericService<FamilyMediaDto, FamilyMediaSearchQuery, FamilyMediaDto, CreateFamilyMediaRequest, FamilyMediaDto> {}

