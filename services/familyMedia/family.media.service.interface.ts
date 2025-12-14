// gia-pha-viet-app/services/familyMedia/family.media.service.interface.ts
import { Result } from '@/types';
import { IGenericService } from '@/services/base/generic.service.interface'; // Import IGenericService
import { FamilyMediaDto, FamilyMediaSearchQuery } from '@/types/familyMedia.d'; // Import FamilyMediaDto and FamilyMediaSearchQuery

export interface CreateFamilyMediaRequest {
  familyId: string;
  file: {
    uri: string;
    name: string;
    type: string;
  };
  description?: string;
  folder?: string; // Folder within storage (e.g., "photos", "videos")
}

export interface IFamilyMediaService extends IGenericService<FamilyMediaDto, FamilyMediaSearchQuery, FamilyMediaDto, CreateFamilyMediaRequest, FamilyMediaDto> {}

