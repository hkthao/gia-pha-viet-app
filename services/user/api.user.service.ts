import { ApiClientMethods } from '@/types/apiClient';
import { IUserService } from './user.service.interface';
import { UserCheckResultDto } from '@/types';

export class ApiUserService implements IUserService {
  constructor(private apiClient: ApiClientMethods) {}

  async checkUserByEmailOrUsername(identifier: string): Promise<UserCheckResultDto> {
    return await this.apiClient.get<UserCheckResultDto>(`/api/v1/users/check-by-identifier`, {
      params: { identifier },
    });
  }
}
