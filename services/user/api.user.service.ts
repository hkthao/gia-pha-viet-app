import { ApiClientMethods } from '@/types/apiClient';
import { IUserService, UserCheckResultDto } from './user.service.interface';

export class ApiUserService implements IUserService {
  constructor(private apiClient: ApiClientMethods) {}

  async checkUserByEmailOrUsername(identifier: string): Promise<UserCheckResultDto> {
    return await this.apiClient.get<UserCheckResultDto>(`/api/v1/users/check-by-identifier`, {
      params: { identifier },
    });
  }
}
