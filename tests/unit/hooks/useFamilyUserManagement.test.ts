import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import { useFamilyUserManagement } from '@/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { userService } from '@/services';
import { FamilyRole } from '@/types';
import { FamilyFormData } from '@/utils/validation/familyValidationSchema';

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
  })),
}));

// Mock userService
jest.mock('@/services', () => ({
  userService: {
    getByIds: jest.fn(),
  },
}));

describe('useFamilyUserManagement', () => {
  const mockInitialFamilyId = 'family123';
  const mockSetValue = jest.fn();
  const mockWatch = jest.fn();
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    (useQuery as jest.Mock).mockReset();
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useTranslation as jest.Mock).mockReturnValue({ t: (key: string) => key });
    (userService.getByIds as jest.Mock).mockReset();
    mockSetValue.mockReset();
    mockWatch.mockReset();
    mockInvalidateQueries.mockReset();
  });

  it('should return empty managers and viewers initially if no familyUsers or fetchedFamilyUserDetails', () => {
    mockWatch.mockReturnValue([]); // No familyUsers
    (useQuery as jest.Mock).mockReturnValue({ data: undefined, isLoading: false }); // No fetchedFamilyUserDetails

    const { result } = renderHook(() =>
      useFamilyUserManagement({
        initialFamilyId: mockInitialFamilyId,
        setValue: mockSetValue,
        watch: mockWatch as any,
      })
    );

    expect(result.current.managers).toEqual([]);
    expect(result.current.viewers).toEqual([]);
  });

  it('should derive managers and viewers correctly', async () => {
    const mockFamilyUsers = [
      { userId: 'user1', role: FamilyRole.Manager, userName: 'Manager One', email: 'm1@example.com' },
      { userId: 'user2', role: FamilyRole.Viewer, userName: 'Viewer One', email: 'v1@example.com' },
    ];
    const mockFetchedUserDetails = [
      { id: 'user1', name: 'Manager One', email: 'm1@example.com' },
      { id: 'user2', name: 'Viewer One', email: 'v1@example.com' },
    ];

    mockWatch.mockReturnValue(mockFamilyUsers);
    (useQuery as jest.Mock).mockReturnValue({ data: mockFetchedUserDetails, isLoading: false });

    const { result } = renderHook(() =>
      useFamilyUserManagement({
        initialFamilyId: mockInitialFamilyId,
        setValue: mockSetValue,
        watch: mockWatch as any,
      })
    );

    expect(result.current.managers).toEqual([
      { id: 'user1', name: 'Manager One', email: 'm1@example.com' },
    ]);
    expect(result.current.viewers).toEqual([
      { id: 'user2', name: 'Viewer One', email: 'v1@example.com' },
    ]);
  });

  it('handleManagersChanged should update familyUsers and invalidate queries', async () => {
    const mockExistingFamilyUsers = [
      { userId: 'user2', role: FamilyRole.Viewer, userName: 'Viewer One', email: 'v1@example.com' },
    ];
    const mockFetchedUserDetails = [
      { id: 'user3', name: 'Manager New', email: 'mn@example.com' },
      { id: 'user2', name: 'Viewer One', email: 'v1@example.com' },
    ];

    mockWatch.mockReturnValue(mockExistingFamilyUsers);
    (useQuery as jest.Mock).mockReturnValue({ data: mockFetchedUserDetails, isLoading: false });

    const { result } = renderHook(() =>
      useFamilyUserManagement({
        initialFamilyId: mockInitialFamilyId,
        setValue: mockSetValue,
        watch: mockWatch as any,
      })
    );

    act(() => {
      result.current.handleManagersChanged(['user3']);
    });

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith(
        'familyUsers',
        [
          {
            familyId: mockInitialFamilyId,
            userId: 'user3',
            userName: 'Manager New',
            email: 'mn@example.com',
            role: FamilyRole.Manager,
          },
          { userId: 'user2', role: FamilyRole.Viewer, userName: 'Viewer One', email: 'v1@example.com' },
        ],
        { shouldValidate: true }
      );
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['familyUserDetails'] });
    });
  });

  it('handleViewersChanged should update familyUsers and invalidate queries', async () => {
    const mockExistingFamilyUsers = [
      { userId: 'user1', role: FamilyRole.Manager, userName: 'Manager One', email: 'm1@example.com' },
    ];
    const mockFetchedUserDetails = [
      { id: 'user1', name: 'Manager One', email: 'm1@example.com' },
      { id: 'user4', name: 'Viewer New', email: 'vn@example.com' },
    ];

    mockWatch.mockReturnValue(mockExistingFamilyUsers);
    (useQuery as jest.Mock).mockReturnValue({ data: mockFetchedUserDetails, isLoading: false });

    const { result } = renderHook(() =>
      useFamilyUserManagement({
        initialFamilyId: mockInitialFamilyId,
        setValue: mockSetValue,
        watch: mockWatch as any,
      })
    );

    act(() => {
      result.current.handleViewersChanged(['user4']);
    });

    await waitFor(() => {
      expect(mockSetValue).toHaveBeenCalledWith(
        'familyUsers',
        [
          { userId: 'user1', role: FamilyRole.Manager, userName: 'Manager One', email: 'm1@example.com' },
          {
            familyId: mockInitialFamilyId,
            userId: 'user4',
            userName: 'Viewer New',
            email: 'vn@example.com',
            role: FamilyRole.Viewer,
          },
        ],
        { shouldValidate: true }
      );
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['familyUserDetails'] });
    });
  });
});
