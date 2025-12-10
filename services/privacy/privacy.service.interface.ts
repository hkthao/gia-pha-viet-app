import { Result } from '@/types';
import { PrivacyConfigurationDto, UpdatePrivacyConfigurationCommand } from '@/types/privacy';

export interface IPrivacyService {
  get(familyId: string): Promise<Result<PrivacyConfigurationDto | null>>;
  update(command: UpdatePrivacyConfigurationCommand): Promise<Result<PrivacyConfigurationDto | null>>;
}
