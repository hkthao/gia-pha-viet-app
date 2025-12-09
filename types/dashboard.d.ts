// apps/admin/src/types/public-dashboard.d.ts

export interface DashboardDto {
  totalFamilies: number;
  totalMembers: number;
  totalRelationships: number;
  totalGenerations: number;
  maleRatio: number;
  femaleRatio: number;
  livingMembersCount: number;
  deceasedMembersCount: number;
  publicAverageAge: number;
  membersPerGeneration: { [key: number]: number };
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
