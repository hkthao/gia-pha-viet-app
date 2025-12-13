import { ApiClientMethods } from '@/types/apiClient';
import { IUserService } from './user.service.interface';
import { UserCheckResultDto, PaginatedList, UserListDto, SearchUsersQuery } from '@/types';

export class ApiUserService implements IUserService {
  constructor(private apiClient: ApiClientMethods) { }

  async getByIds(ids: string[]): Promise<UserListDto[]> {
    return await this.apiClient.get<UserListDto[]>(`/user/by-ids`, {
      params: { ids: ids.join(",") },
    });
  }

  async checkUserByEmailOrUsername(identifier: string): Promise<UserCheckResultDto> {
    const response = await this.apiClient.get<UserCheckResultDto>(`/user/check-by-identifier`, {
      params: { identifier },
    });
    return response;
  }

  async search(query: SearchUsersQuery): Promise<PaginatedList<UserListDto>> {
    const response = await this.apiClient.get<PaginatedList<UserListDto>>(`/user/search`, {
      params: query,
    });
    return response;
  }
}

