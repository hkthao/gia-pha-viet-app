// apps/admin/src/types/public-dashboard.d.ts

export interface DashboardDto {
  totalFamilies: number;
  totalMembers: number;
  totalRelationships: number;
  totalGenerations: number;
  publicMaleRatio: number;
  publicFemaleRatio: number;
  publicLivingMembersCount: number;
  publicDeceasedMembersCount: number;
  publicAverageAge: number;
  publicMembersPerGeneration: { [key: number]: number };
  totalEvents: number;
}

export interface DashboardMetrics {
  totalMembers: number;
  totalRelationships: number;
  totalGenerations: number;
  averageAge: number;
  livingMembers: number;
  deceasedMembers: number;
  genderDistribution: { name: string; population: number; color: string; legendFontColor: string; legendFontSize: number; }[];
  membersPerGeneration: { [key: number]: number };
  totalEvents: number;
}
