import { act, renderHook } from '@testing-library/react-hooks';
import { create } from 'zustand';
import { createDashboardStore } from '@/stores/useDashboardStore';
import { IDashboardService } from '@/services/dashboard/dashboard.service.interface';
import { Result } from '@/types';
import { DashboardMetrics } from '@/types/public-dashboard-metrics';

// Mock authService to prevent it from trying to initialize Auth0 components and AsyncStorage
jest.mock('@/services/authService', () => ({
  authService: {
    getAccessToken: jest.fn(() => null),
    login: jest.fn(() => Promise.resolve()),
    logout: jest.fn(() => Promise.resolve()),
    register: jest.fn(() => Promise.resolve()),
    retrieveAuthSession: jest.fn(() => Promise.resolve(null)),
    refreshAccessToken: jest.fn(() => Promise.resolve(null)),
    getTokenClaims: jest.fn(() => null),
    isAuthenticated: jest.fn(() => false),
  },
}));

// Mock Dashboard Metrics for testing
const mockDashboardMetrics: DashboardMetrics = {
  totalMembers: 100,
  totalFamilies: 10,
  eventsThisMonth: 5,
  recentActivities: [],
  averageLifespan: 75,
};

describe('useDashboardStore', () => {
  let mockDashboardService: IDashboardService;
  let useStore: ReturnType<typeof create>;

  beforeEach(() => {
    // Reset the mock service before each test
    mockDashboardService = {
      getDashboardData: jest.fn(),
    };

    // Create a new store instance for each test
    const storeFactory = createDashboardStore(mockDashboardService);
    useStore = create(storeFactory);
  });

  afterEach(() => {
    // Ensure all mocks are cleared after each test
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useStore((state) => state));

    expect(result.current.dashboardData).toBeNull();
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should fetch dashboard data successfully', async () => {
    (mockDashboardService.getDashboardData as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockDashboardMetrics,
    } as Result<DashboardMetrics>);

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.getDashboardData('family123');
    });

    // Check loading state immediately after action call
    expect(result.current.loading).toBeTruthy();
    expect(result.current.error).toBeNull();

    await waitForNextUpdate(); // Wait for the state update to propagate

    expect(mockDashboardService.getDashboardData).toHaveBeenCalledWith('family123');
    expect(result.current.dashboardData).toEqual(mockDashboardMetrics);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should handle API error when fetching dashboard data', async () => {
    const errorMessage = 'Network Error';
    (mockDashboardService.getDashboardData as jest.Mock).mockResolvedValueOnce({
      isSuccess: false,
      error: { message: errorMessage },
    } as Result<DashboardMetrics>);

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.getDashboardData('family123');
    });

    // Check loading state immediately after action call
    expect(result.current.loading).toBeTruthy();
    expect(result.current.error).toBeNull();

    await waitForNextUpdate(); // Wait for the state update to propagate

    expect(mockDashboardService.getDashboardData).toHaveBeenCalledWith('family123');
    expect(result.current.dashboardData).toBeNull();
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle thrown error when fetching dashboard data', async () => {
    const errorMessage = 'Something went wrong!';
    (mockDashboardService.getDashboardData as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.getDashboardData('family123');
    });

    // Check loading state immediately after action call
    expect(result.current.loading).toBeTruthy();
    expect(result.current.error).toBeNull();

    await waitForNextUpdate(); // Wait for the state update to propagate

    expect(mockDashboardService.getDashboardData).toHaveBeenCalledWith('family123');
    expect(result.current.dashboardData).toBeNull();
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBe(errorMessage);
  });

  it('should set loading to true while fetching data and then to false', async () => {
    (mockDashboardService.getDashboardData as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockDashboardMetrics,
    } as Result<DashboardMetrics>);

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.getDashboardData('family123');
    });

    expect(result.current.loading).toBeTruthy();
    expect(result.current.error).toBeNull();

    await waitForNextUpdate();

    expect(result.current.loading).toBeFalsy();
    expect(result.current.dashboardData).toEqual(mockDashboardMetrics);
  });

  it('should reset the store state', async () => {
    // First, set some data to be able to reset
    (mockDashboardService.getDashboardData as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockDashboardMetrics,
    } as Result<DashboardMetrics>);

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.getDashboardData('family123');
    });
    await waitForNextUpdate(); // Wait for data to be fetched

    expect(result.current.dashboardData).toEqual(mockDashboardMetrics);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();

    // Now, reset the store
    act(() => {
      result.current.reset();
    });

    expect(result.current.dashboardData).toBeNull();
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });
});