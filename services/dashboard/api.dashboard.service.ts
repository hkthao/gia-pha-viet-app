// apps/mobile/family_tree_rn/services/dashboard/api.dashboard.service.ts

import { ApiClientMethods } from '@/types';
import { Result, ApiError, DashboardDto, DashboardMetrics } from '@/types';
import { IDashboardService } from '@/services/dashboard/dashboard.service.interface';

// Helper function from dashboardService.ts
const getGenderColor = (gender: string): string => {
  switch (gender.toLowerCase()) {
    case 'male':
      return '#1E90FF'; // DodgerBlue
    case 'female':
      return '#FF69B4'; // HotPink
    default:
      return '#808080'; // Gray
  }
};

export class ApiDashboardService implements IDashboardService {
  constructor(private api: ApiClientMethods) {}

  async getDashboardData(familyId: string): Promise<Result<DashboardMetrics>> {
    try {
      const data = await this.api.get<DashboardDto>(`/dashboard/stats`, {
        params: {
          familyId: familyId,
        },
      });

      const dashboardMetrics: DashboardMetrics = {
        totalMembers: data.totalMembers,
        totalRelationships: data.totalRelationships,
        totalGenerations: data.totalGenerations,
        averageAge: data.publicAverageAge,
        livingMembers: data.livingMembersCount,
        deceasedMembers: data.deceasedMembersCount,
        genderDistribution: [
          {
            name: 'Male',
            population: Number((data.maleRatio * 100).toFixed(2)), // Convert ratio to percentage and round for display
            color: getGenderColor('male'),
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
          },
          {
            name: 'Female',
            population: Number((data.femaleRatio * 100).toFixed(2)), // Convert ratio to percentage and round for display
            color: getGenderColor('female'),
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
          },
        ],
        membersPerGeneration: data.membersPerGeneration,
        totalEvents: data.totalEvents,
      };

      return { isSuccess: true, value: dashboardMetrics };
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
        statusCode: error.response?.status,
      };
      return { isSuccess: false, error: apiError };
    }
  }
}
