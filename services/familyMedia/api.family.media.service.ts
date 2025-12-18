// gia-pha-viet-app/services/familyMedia/api.family.media.service.ts
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



  // Override the create method to handle file uploads
  async create(request: CreateFamilyMediaRequest): Promise<Result<FamilyMediaDto>> {
    try {
      const formData = new FormData();
      // Append the image file
      formData.append('file', {
        uri: request.file.uri,
        name: request.file.name,
        type: request.file.type,
      } as any); // Type assertion for FormData.append

      formData.append('familyId', request.familyId);
      if (request.description) formData.append('description', request.description);
      if (request.folder) formData.append('folder', request.folder);

      const response = await this.apiClient.post<FamilyMediaDto>(`${this.baseEndpoint}/${request.familyId}`, formData, {
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
