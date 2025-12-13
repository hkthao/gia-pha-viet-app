// apps/mobile/family_tree_rn/services/family/api.family.service.ts

import { FamilyListDto, SearchFamiliesQuery, FamilyDetailDto, PaginatedList, Result as TResult, FamilyCreateRequestDto, FamilyUpdateRequestDto } from '@/types';
import { IFamilyService } from '@/services/family/family.service.interface';
import { GenericService } from '../base/abstract.generic.service';
import { ApiClientMethods } from '@/types/apiClient';
import { Result } from '@/utils/resultUtils'; // Import Result as a value
import { FamilyUserDto } from '@/types/family'; // Explicitly import FamilyUserDto

export class ApiFamilyService extends GenericService<FamilyListDto, SearchFamiliesQuery, FamilyDetailDto, FamilyCreateRequestDto, FamilyUpdateRequestDto> implements IFamilyService {
  protected get baseEndpoint(): string {
    return '/family';
  }

  constructor(apiClient: ApiClientMethods) {
    super(apiClient);
  }

  // Implement getMyAccess from IPermissionService
  async getMyAccess(): Promise<TResult<FamilyUserDto[]>> {
    try {
      const response = await this.apiClient.get<FamilyUserDto[]>('/family/my-access');
      return Result.success(response);
    } catch (error: any) {
      return Result.fail(error.response?.data?.message || error.message || 'Failed to fetch user access permissions');
    }
  }
}
