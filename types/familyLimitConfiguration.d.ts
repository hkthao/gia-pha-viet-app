// gia-pha-viet-app/src/types/familyLimitConfiguration.d.ts

export interface FamilyLimitConfigurationDto {
  id: string;
  familyId: string;
  maxMembers: number;
  maxStorageMb: number;
  aiChatMonthlyLimit: number;
  aiChatMonthlyUsage: number;
}
