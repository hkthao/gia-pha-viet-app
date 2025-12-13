import { ApiClientMethods } from '@/types/apiClient';
import { IUserService } from './user.service.interface';
import { UserCheckResultDto, PaginatedList, UserListDto, SearchUsersQuery } from '@/types';

export class ApiUserService implements IUserService {
  constructor(private apiClient: ApiClientMethods) {}

  async checkUserByEmailOrUsername(identifier: string): Promise<UserCheckResultDto> {
    const response = await this.apiClient.get<UserCheckResultDto>(`/api/v1/users/check-by-identifier`, {
      params: { identifier },
    });
    return response;
  }

  async search(query: SearchUsersQuery): Promise<PaginatedList<UserListDto>> {
    const response = await this.apiClient.get<PaginatedList<UserListDto>>(`/api/v1/users/search`, {
      params: query,
    });
    return response;
  }
}

