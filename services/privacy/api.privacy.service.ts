import { ApiClientMethods } from '@/types/apiClient';
import { PrivacyConfigurationDto, UpdatePrivacyConfigurationCommand } from '@/types/privacy';
import { IPrivacyService } from './privacy.service.interface';
import { Result } from '@/types';

export class ApiPrivacyService implements IPrivacyService {
  private apiClient: ApiClientMethods;

  constructor(apiClient: ApiClientMethods) {
    this.apiClient = apiClient;
  }

  async get(familyId: string): Promise<Result<PrivacyConfigurationDto | null>> {
    try {
      const response = await this.apiClient.get<PrivacyConfigurationDto>(`/family/${familyId}/privacy-configuration`);
      return { isSuccess: true, value: response };
    } catch (error: any) {
      return { isSuccess: false, error: error.message || 'Failed to fetch privacy configuration' };
    }
  }

  async update(command: UpdatePrivacyConfigurationCommand): Promise<Result<PrivacyConfigurationDto | null>> {
    try {
      const response = await this.apiClient.put<PrivacyConfigurationDto>(`/family/${command.familyId}/privacy-configuration`, command);
      return { isSuccess: true, value: response };
    } catch (error: any) {
      return { isSuccess: false, error: error.message || 'Failed to update privacy configuration' };
    }
  }
}
