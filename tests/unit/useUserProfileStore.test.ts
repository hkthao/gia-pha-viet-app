import { act, renderHook } from '@testing-library/react-hooks';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { createUserProfileStore, UserProfileStore } from '@/stores/useUserProfileStore';
import { IUserProfileService } from '@/services';
import { UserProfileDto, Result } from '@/types';

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

// Mock UserProfile data for testing
const mockUserProfile: UserProfileDto = {
  id: 'user1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '123-456-7890',
  avatarUrl: 'http://example.com/avatar.png',
  bio: 'A test user profile.',
  familyId: 'family123',
  created: '2023-01-01T00:00:00Z',
};

describe('useUserProfileStore', () => {
  let mockUserProfileService: IUserProfileService;
  let useStore: UseBoundStore<StoreApi<UserProfileStore>>;

  beforeEach(() => {
    mockUserProfileService = {
      getCurrentUserProfile: jest.fn(),
    };

    const storeFactory = createUserProfileStore(mockUserProfileService);
    useStore = create(storeFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useStore((state) => state));

    expect(result.current.userProfile).toBeNull();
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  describe('fetchUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      (mockUserProfileService.getCurrentUserProfile as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockUserProfile,
      } as Result<UserProfileDto>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchUserProfile();
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockUserProfileService.getCurrentUserProfile).toHaveBeenCalledTimes(1);
      expect(result.current.userProfile).toEqual(mockUserProfile);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching user profile', async () => {
      const errorMessage = 'User profile not found';
      (mockUserProfileService.getCurrentUserProfile as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<UserProfileDto>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchUserProfile();
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockUserProfileService.getCurrentUserProfile).toHaveBeenCalledTimes(1);
      expect(result.current.userProfile).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching user profile', async () => {
      const errorMessage = 'Network error';
      (mockUserProfileService.getCurrentUserProfile as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchUserProfile();
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockUserProfileService.getCurrentUserProfile).toHaveBeenCalledTimes(1);
      expect(result.current.userProfile).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should clear user profile', () => {
    act(() => {
      useStore.setState({ userProfile: mockUserProfile });
    });

    const { result } = renderHook(() => useStore((state) => state));
    expect(result.current.userProfile).toEqual(mockUserProfile);

    act(() => {
      result.current.clearUserProfile();
    });

    expect(result.current.userProfile).toBeNull();
    expect(result.current.error).toBeNull(); // Ensure error is also cleared as per store logic
  });

  it('should reset the store state', async () => {
    // First, set some data to be able to reset
    (mockUserProfileService.getCurrentUserProfile as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockUserProfile,
    } as Result<UserProfileDto>);

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.fetchUserProfile();
    });
    await waitForNextUpdate(); // Wait for data to be fetched

    expect(result.current.userProfile).toEqual(mockUserProfile);
    expect(result.current.loading).toBeFalsy();

    // Now, reset the store
    act(() => {
      result.current.reset();
    });

    expect(result.current.userProfile).toBeNull();
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should set an error message', () => {
    const { result } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.setError('Custom error message');
    });

    expect(result.current.error).toBe('Custom error message');
  });
});
