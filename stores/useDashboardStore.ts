import { create, StateCreator } from 'zustand';
import { dashboardService as defaultDashboardService } from '@/services';
import { DashboardMetrics, Result } from '@/types';
import { IDashboardService } from '@/services/dashboard/dashboard.service.interface';

import { parseError } from '@/utils/errorUtils';

interface DashboardState {
  dashboardData: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
}

interface DashboardActions {
  getDashboardData: (familyId: string) => Promise<void>;
  reset: () => void; // Thêm hàm reset để dễ dàng thiết lập lại trạng thái trong các bài kiểm thử
}

export type DashboardStore = DashboardState & DashboardActions;

// Factory function để tạo store
export const createDashboardStore = (
  dashboardService: IDashboardService
): StateCreator<DashboardStore> => (set, get) => ({
  dashboardData: null,
  loading: false,
  error: null,

  getDashboardData: async (familyId: string) => {
    set(state => ({ ...state, loading: true, error: null })); // Sử dụng callback cho set
    try {
      const result: Result<DashboardMetrics> = await dashboardService.getDashboardData(familyId);
      if (result.isSuccess && result.value) {
        set(state => ({ ...state, dashboardData: result.value, loading: false })); // Sử dụng callback cho set
      } else {
        const errorMessage = parseError(result.error);
        set(state => ({ ...state, error: errorMessage, loading: false })); // Sử dụng callback cho set
      }
    } catch (err: any) {
      const errorMessage = parseError(err);
      set(state => ({ ...state, error: errorMessage, loading: false })); // Sử dụng callback cho set
    }
  },

  reset: () =>
    set({
      dashboardData: null,
      loading: false,
      error: null,
    }),
});

// Export default store instance
export const useDashboardStore = create<DashboardStore>(createDashboardStore(defaultDashboardService));