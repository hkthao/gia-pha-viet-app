// Mock all necessary modules
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/hooks/ui/useGlobalSnackbar', () => ({
  useGlobalSnackbar: jest.fn(),
}));
jest.mock('@/stores/useFamilyListStore', () => ({
  useFamilyListStore: jest.fn(), // Will use mockImplementation in beforeEach
}));
jest.mock('@/services', () => ({
  familyService: {
    create: jest.fn(),
  },
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Mock translation function
  }),
}));
jest.mock('@/components/common/GlobalSnackbar', () => {
  return jest.fn(() => null); // Render nothing for GlobalSnackbar in tests
});

import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateFamily } from '@/hooks/family/useCreateFamily';
import { familyService } from '@/services';
import { useGlobalSnackbar } from '@/hooks/ui/useGlobalSnackbar';
import { useFamilyListStore } from '@/stores/useFamilyListStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { FamilyDetailDto } from '@/types';

describe('useCreateFamily', () => {
  let queryClient: QueryClient;
  let mockShowSnackbar: jest.Mock;
  let mockSearchFamilyList: jest.Mock;
  let mockRouterReplace: jest.Mock;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    mockShowSnackbar = jest.fn();
    mockSearchFamilyList = jest.fn();
    mockRouterReplace = jest.fn();

    (useGlobalSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });
    // Correctly mock useFamilyListStore to simulate selector behavior
    mockSearchFamilyList = jest.fn(); // Define mockSearchFamilyList here
    (useFamilyListStore as unknown as jest.Mock).mockImplementation((selector) =>
      selector({
        search: mockSearchFamilyList,
      })
    );
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockRouterReplace,
    });
    (familyService.create as jest.Mock).mockReset();
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('should successfully create a family and show success snackbar, invalidate queries, and navigate', async () => {
    const mockFamily: FamilyDetailDto = {
      id: '1',
      name: 'Test Family',
      description: 'A test family',
      address: '123 Test St',
      avatarUrl: undefined,
      visibility: 'Public',
      totalMembers: 0,
      totalGenerations: 0,
      created: new Date().toISOString(), // Changed from createdAt
      lastModified: new Date().toISOString(), // Changed from updatedAt
      code: 'FAM1',
      familyUsers: [],
    };
    (familyService.create as jest.Mock).mockResolvedValueOnce({ // Direct mock of return value
        isSuccess: true,
        value: mockFamily,
        error: undefined,
    });

    const { result, waitFor } = renderHook(() => useCreateFamily(), { wrapper: createWrapper() });

    const familyData = {
      name: 'Test Family',
      description: 'A test family',
      address: '123 Test St',
      avatarUrl: undefined,
      visibility: 'Public' as 'Public' | 'Private',
      familyUsers: [],
    };

    await act(async () => {
      await result.current.createFamily(familyData);
    });

    await waitFor(() => result.current.isCreatingFamily === false);

    expect(familyService.create).toHaveBeenCalledWith({
      name: 'Test Family',
      description: 'A test family',
      address: '123 Test St',
      avatarUrl: undefined,
      visibility: 'Public',
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith('familyForm.createSuccess', 'success');
    expect(mockSearchFamilyList).toHaveBeenCalledWith({ page: 1, itemsPerPage: 10, searchQuery: '' }, true);
    expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)/search');
  });

  it('should show error snackbar if family creation fails due to API error', async () => {
    const errorMessage = 'API error message';
    (familyService.create as jest.Mock).mockResolvedValueOnce({ // Direct mock
        isSuccess: false,
        error: { message: errorMessage },
        value: undefined,
    });

    const { result, waitFor } = renderHook(() => useCreateFamily(), { wrapper: createWrapper() });

    const familyData = {
      name: 'Test Family',
      description: 'A test family',
      address: '123 Test St',
      avatarUrl: undefined,
      visibility: 'Private' as 'Public' | 'Private',
      familyUsers: [],
    };

    await act(async () => {
      await result.current.createFamily(familyData);
    });

    await waitFor(() => result.current.isCreatingFamily === false);

    expect(familyService.create).toHaveBeenCalledWith({
      name: 'Test Family',
      description: 'A test family',
      address: '123 Test St',
      avatarUrl: undefined,
      visibility: 'Private',
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith(errorMessage, 'error');
    expect(mockSearchFamilyList).not.toHaveBeenCalled();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('should show error snackbar if family creation throws a network error', async () => {
    const networkError = new Error('Network issues');
    (familyService.create as jest.Mock).mockRejectedValueOnce(networkError); // Reject directly with the Error object

    const { result, waitFor } = renderHook(() => useCreateFamily(), { wrapper: createWrapper() });

    const familyData = {
      name: 'Test Family',
      description: 'A test family',
      address: '123 Test St',
      avatarUrl: undefined,
      visibility: 'Public' as 'Public' | 'Private',
      familyUsers: [],
    };

    await act(async () => {
      await result.current.createFamily(familyData);
    });

    await waitFor(() => result.current.isCreatingFamily === false);

    expect(familyService.create).toHaveBeenCalledWith({
      name: 'Test Family',
      description: 'A test family',
      address: '123 Test St',
      avatarUrl: undefined,
      visibility: 'Public',
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith(networkError.message, 'error');
    expect(mockSearchFamilyList).not.toHaveBeenCalled();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});