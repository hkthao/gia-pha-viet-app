// apps/mobile/family_tree_rn/services/family/api.family.service.ts

import { FamilyListDto, SearchFamiliesQuery, FamilyDetailDto, Result, PaginatedList, FamilyCreateRequestDto, FamilyUpdateRequestDto } from '@/types';
import { IFamilyService } from '@/services/family/family.service.interface';
import { GenericService } from '../base/abstract.generic.service';

import { Result as ResultHelperValue } from '@/utils/resultUtils'; // Import Result as a value
import { FamilyUserDto } from '@/types/family'; // Explicitly import FamilyUserDto

export class ApiFamilyService extends GenericService<FamilyListDto, SearchFamiliesQuery, FamilyDetailDto, FamilyCreateRequestDto, FamilyUpdateRequestDto> implements IFamilyService {
  protected get baseEndpoint(): string {
    return '/family';
  }



  // Implement getMyAccess from IPermissionService
  async getMyAccess(): Promise<Result<FamilyUserDto[]>> {
    try {
      const response = await this.apiClient.get<FamilyUserDto[]>('/family/my-access');
      return ResultHelperValue.success(response);
    } catch (error: any) {
      return ResultHelperValue.fail(error.response?.data?.message || error.message || 'Failed to fetch user access permissions');
    }
  }

  async publicSearch(filter: SearchFamiliesQuery): Promise<Result<PaginatedList<FamilyListDto>>> {
    try {
      const response = await this.apiClient.get<PaginatedList<FamilyListDto>>(`${this.baseEndpoint}/public-search`, {
        params: filter,
      });
      return ResultHelperValue.success(response);
    } catch (error: any) {
      return ResultHelperValue.fail(error.response?.data?.message || error.message || 'Failed to fetch public families');
    }
  }
}
