// gia-pha-viet-app/hooks/dashboard/useDashboardQuery.ts
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services';
import type { DashboardMetrics } from '@/types';
import { parseError } from '@/utils/errorUtils';

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  details: () => [...dashboardQueryKeys.all, 'detail'] as const,
  detail: (familyId: string) => [...dashboardQueryKeys.details(), familyId] as const,
};

export const useGetDashboardDataQuery = (familyId: string) => {
  return useQuery<DashboardMetrics, string>({
    queryKey: dashboardQueryKeys.detail(familyId),
    queryFn: async () => {
      const result = await dashboardService.getDashboardData(familyId);
      if (result.isSuccess && result.value) {
        return result.value;
      }
      throw new Error(parseError(result.error));
    },
    enabled: !!familyId, // Only run the query if familyId is provided
  });
};
