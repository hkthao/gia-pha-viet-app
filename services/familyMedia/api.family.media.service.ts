// gia-pha-viet-app/services/familyMedia/api.family.media.service.ts
import { ApiClientMethods } from '@/types';
import { Result } from '@/types';
import { IFamilyMediaService, CreateFamilyMediaRequest } from './family.media.service.interface';
import { ResultHelper } from '@/utils/resultUtils';
import { parseError } from '@/utils/errorUtils';
import { GenericService } from '@/services/base/abstract.generic.service';
import { FamilyMediaDto, FamilyMediaSearchQuery } from '@/types/familyMedia.d';

export class ApiFamilyMediaService extends GenericService<FamilyMediaDto, FamilyMediaSearchQuery, FamilyMediaDto, CreateFamilyMediaRequest, FamilyMediaDto> implements IFamilyMediaService {
  protected get baseEndpoint(): string {
    return '/family-media';
  }

  constructor(apiClient: ApiClientMethods) {
    super(apiClient);
  }

  // Override the create method to handle file uploads
  async create(request: CreateFamilyMediaRequest): Promise<Result<FamilyMediaDto>> {
    try {
      const formData = new FormData();
      const byteCharacters = atob(request.file.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: request.mediaType || 'application/octet-stream' });

      formData.append('file', blob, request.fileName);

      formData.append('familyId', request.familyId);
      if (request.mediaType) formData.append('mediaType', request.mediaType);
      if (request.description) formData.append('description', request.description);
      if (request.folder) formData.append('folder', request.folder);

      const response = await this.apiClient.post<FamilyMediaDto>(`${this.baseEndpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return ResultHelper.success(response);
    } catch (error: any) {
      return ResultHelper.fail(parseError(error));
    }
  }
}
