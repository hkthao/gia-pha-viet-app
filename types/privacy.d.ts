import { BaseAuditableDto, BaseResponse } from './common';

export interface PrivacyConfigurationDto extends BaseAuditableDto {
  familyId: string;
  publicMemberProperties: string[];
}

export interface UpdatePrivacyConfigurationCommand {
  familyId: string;
  publicMemberProperties: string[];
}

// Response for privacy configuration
export interface PrivacyConfigurationResponse extends BaseResponse {
  privacyConfiguration?: PrivacyConfigurationDto;
}
