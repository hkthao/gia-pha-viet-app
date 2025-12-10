import { ApiClientMethods } from '@/types/apiClient';
import { Result } from '@/types/api';
import { apiClientWithAuth } from './api';
import { FamilyUserDto } from '@/types';

export interface IPermissionService {
  getMyAccess(): Promise<Result<FamilyUserDto[]>>;
}

export class PermissionService implements IPermissionService {
  private apiClient: ApiClientMethods;

  constructor(apiClient: ApiClientMethods) {
    this.apiClient = apiClient;
  }

  async getMyAccess(): Promise<Result<FamilyUserDto[]>> {
    try {
      const response = await this.apiClient.get<FamilyUserDto[]>('/family/my-access');
      return { isSuccess: true, value: response };
    } catch (error: any) {
      return { isSuccess: false, error: { message: error.message || 'Failed to fetch user permissions' } };
    }
  }
}

export const permissionService: IPermissionService = new PermissionService(apiClientWithAuth);
