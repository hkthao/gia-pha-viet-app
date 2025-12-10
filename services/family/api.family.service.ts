// apps/mobile/family_tree_rn/services/family/api.family.service.ts

import { FamilyListDto, SearchFamiliesQuery, FamilyDetailDto, PaginatedList, Result as TResult } from '@/types';
import { IFamilyService } from '@/services/family/family.service.interface';
import { GenericService } from '../base/abstract.generic.service';
import { ApiClientMethods } from '@/types/apiClient';
import { Result } from '@/utils/resultUtils'; // Import Result as a value
import { FamilyUserDto } from '@/types/family'; // Explicitly import FamilyUserDto

export class ApiFamilyService extends GenericService<FamilyListDto, SearchFamiliesQuery, FamilyDetailDto> implements IFamilyService {
  protected get baseEndpoint(): string {
    return '/family';
  }

  constructor(apiClient: ApiClientMethods) {
    super(apiClient);
  }

  // Override search to return FamilyListDto as per IFamilyService,
  // and ensure it returns a Result object.
  async search(filter: SearchFamiliesQuery): Promise<TResult<PaginatedList<FamilyListDto>>> {
    try {
      const response = await this.apiClient.get<PaginatedList<FamilyListDto>>(`${this.baseEndpoint}/search`, { params: filter });
      return Result.success(response); // apiClient.get returns AxiosResponse, data property holds the actual response
    } catch (error: any) {
      return Result.fail(error.response?.data?.message || error.message);
    }
  }

  // Explicitly implement getById for FamilyDetailDto
  async getById(id: string): Promise<TResult<FamilyDetailDto>> {
    try {
      const response = await this.apiClient.get<FamilyDetailDto>(`${this.baseEndpoint}/${id}`);
      return Result.success(response);
    } catch (error: any) {
      return Result.fail(error.response?.data?.message || error.message);
    }
  }

  // Explicitly implement create for FamilyDetailDto
  async create(entity: Partial<FamilyDetailDto>): Promise<TResult<FamilyDetailDto>> {
    try {
      const response = await this.apiClient.post<FamilyDetailDto>(this.baseEndpoint, entity);
      return Result.success(response);
    } catch (error: any) {
      return Result.fail(error.response?.data?.message || error.message);
    }
  }

  // Explicitly implement update for FamilyDetailDto
  async update(id: string, entity: Partial<FamilyDetailDto>): Promise<TResult<FamilyDetailDto>> {
    try {
      const response = await this.apiClient.put<FamilyDetailDto>(`${this.baseEndpoint}/${id}`, entity);
      return Result.success(response);
    } catch (error: any) {
      return Result.fail(error.response?.data?.message || error.message);
    }
  }

  // Explicitly implement delete
  async delete(id: string): Promise<TResult<void>> {
    try {
      await this.apiClient.delete(`${this.baseEndpoint}/${id}`);
      return Result.success(undefined);
    } catch (error: any) {
      return Result.fail(error.response?.data?.message || error.message);
    }
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
