import { act, renderHook } from '@testing-library/react-hooks';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { createPublicMemberStore, PublicMemberStore } from '@/stores/usePublicMemberStore';
import { IMemberService } from '@/services';
import { MemberListDto, SearchPublicMembersQuery, MemberDetailDto, PaginatedList, Result, Gender } from '@/types';

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

// Mock Member data for testing
const mockMemberDetail: MemberDetailDto = {
  id: 'member1',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  nickname: 'Johnny',
  dateOfBirth: '1990-01-01T00:00:00Z',
  dateOfDeath: null,
  placeOfBirth: 'New York',
  placeOfDeath: null,
  gender: Gender.Male,
  avatarUrl: 'http://example.com/avatar1.png',
  occupation: 'Engineer',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  address: '123 Main St',
  familyId: 'family123',
  biography: 'A brief bio.',
  isRoot: false,
  birthDeathYears: '1990 -',
  fatherFullName: 'Father Doe',
  motherFullName: 'Mother Doe',
  husbandFullName: undefined,
  wifeFullName: undefined,
  fatherId: 'father1',
  motherId: 'mother1',
  husbandId: undefined,
  wifeId: undefined,
  sourceRelationships: [],
  targetRelationships: [],
  created: '2023-01-01T00:00:00Z',
};

const mockMemberList: MemberListDto = {
  id: 'member1',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  code: 'JD001',
  avatarUrl: 'http://example.com/avatar1.png',
  familyId: 'family123',
  familyName: 'Doe Family',
  isRoot: false,
  dateOfBirth: '1990-01-01T00:00:00Z',
  dateOfDeath: null,
  gender: Gender.Male,
  occupation: 'Engineer',
  fatherFullName: 'Father Doe',
  motherFullName: 'Mother Doe',
  husbandFullName: undefined,
  wifeFullName: undefined,
  fatherId: 'father1',
  motherId: 'mother1',
  husbandId: undefined,
  wifeId: undefined,
  fatherGender: Gender.Male,
  motherGender: Gender.Female,
  husbandGender: undefined,
  wifeGender: undefined,
  birthDeathYears: '1990 -',
  created: '2023-01-01T00:00:00Z',
};

const mockMembersPage1: PaginatedList<MemberListDto> = {
  items: [
    { ...mockMemberList, id: 'memberA', fullName: 'Member A' },
    { ...mockMemberList, id: 'memberB', fullName: 'Member B' },
  ],
  page: 1,
  totalItems: 20,
  totalPages: 2,
};

const mockMembersPage2: PaginatedList<MemberListDto> = {
  items: [
    { ...mockMemberList, id: 'memberC', fullName: 'Member C' },
    { ...mockMemberList, id: 'memberD', fullName: 'Member D' },
  ],
  page: 2,
  totalItems: 20,
  totalPages: 2,
};

describe('usePublicMemberStore', () => {
  let mockMemberService: IMemberService;
  let useStore: UseBoundStore<StoreApi<PublicMemberStore>>;

  beforeEach(() => {
    mockMemberService = {
      getMemberById: jest.fn(),
      searchMembers: jest.fn(),
    };

    const storeFactory = createPublicMemberStore(mockMemberService);
    useStore = create(storeFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useStore((state) => state));

    expect(result.current.member).toBeNull();
    expect(result.current.members).toEqual([]);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBeTruthy();
  });

  describe('getMemberById', () => {
    it('should fetch member by id successfully', async () => {
      (mockMemberService.getMemberById as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockMemberDetail,
      } as Result<MemberDetailDto>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getMemberById('member1', 'family123');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockMemberService.getMemberById).toHaveBeenCalledWith('member1', 'family123');
      expect(result.current.member).toEqual(mockMemberDetail);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching member by id', async () => {
      const errorMessage = 'Member not found';
      (mockMemberService.getMemberById as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<MemberDetailDto>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getMemberById('member1', 'family123');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockMemberService.getMemberById).toHaveBeenCalledWith('member1', 'family123');
      expect(result.current.member).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching member by id', async () => {
      const errorMessage = 'Network error';
      (mockMemberService.getMemberById as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getMemberById('member1', 'family123');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockMemberService.getMemberById).toHaveBeenCalledWith('member1', 'family123');
      expect(result.current.member).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('fetchMembers', () => {
    const query: SearchPublicMembersQuery = { familyId: 'family123', page: 1, itemsPerPage: 10 };

    it('should fetch initial members successfully', async () => {
      (mockMemberService.searchMembers as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockMembersPage1,
      } as Result<PaginatedList<MemberListDto>>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchMembers(query, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockMemberService.searchMembers).toHaveBeenCalledWith(query);
      expect(result.current.members).toEqual(mockMembersPage1.items);
      expect(result.current.totalItems).toBe(mockMembersPage1.totalItems);
      expect(result.current.page).toBe(mockMembersPage1.page);
      expect(result.current.totalPages).toBe(mockMembersPage1.totalPages);
      expect(result.current.hasMore).toBeTruthy();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should fetch more members successfully (isRefreshing = false)', async () => {
      // Initial fetch
      (mockMemberService.searchMembers as jest.Mock)
        .mockResolvedValueOnce({ isSuccess: true, value: mockMembersPage1 })
        .mockResolvedValueOnce({ isSuccess: true, value: mockMembersPage2 });

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      await act(async () => {
        await result.current.fetchMembers(query, false); // First page
      });

      expect(result.current.members).toEqual(mockMembersPage1.items);
      expect(result.current.page).toBe(1);

      // Fetch second page
      const queryPage2 = { ...query, page: 2 };
      act(() => {
        result.current.fetchMembers(queryPage2, false);
      });
      expect(result.current.loading).toBeTruthy();

      await waitForNextUpdate();

      expect(mockMemberService.searchMembers).toHaveBeenCalledWith(queryPage2);
      expect(result.current.members).toEqual([...mockMembersPage1.items, ...mockMembersPage2.items]);
      expect(result.current.totalItems).toBe(mockMembersPage2.totalItems);
      expect(result.current.page).toBe(mockMembersPage2.page);
      expect(result.current.totalPages).toBe(mockMembersPage2.totalPages);
      expect(result.current.hasMore).toBeFalsy(); // Based on mockMembersPage2
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should refresh members successfully (isRefreshing = true)', async () => {
        // Setup initial state with some data first
        (mockMemberService.searchMembers as jest.Mock)
            .mockResolvedValueOnce({ isSuccess: true, value: mockMembersPage1 })
            .mockResolvedValueOnce({ isSuccess: true, value: mockMembersPage2 }); // Mock for refresh

        const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

        await act(async () => {
            await result.current.fetchMembers(query, false);
        });
        expect(result.current.members).toEqual(mockMembersPage1.items);
        expect(result.current.page).toBe(1);

        // Now refresh
        act(() => {
            result.current.fetchMembers(query, true); // isRefreshing = true
        });
        expect(result.current.loading).toBeTruthy();

        await waitForNextUpdate();

        expect(mockMemberService.searchMembers).toHaveBeenCalledWith({ ...query, page: 1 }); // When refreshing, it should always fetch the first page
        expect(result.current.members).toEqual(mockMembersPage2.items); // Should be replaced with refresh data
        expect(result.current.totalItems).toBe(mockMembersPage2.totalItems);
        expect(result.current.page).toBe(mockMembersPage2.page);
        expect(result.current.totalPages).toBe(mockMembersPage2.totalPages);
        expect(result.current.hasMore).toBeFalsy(); // Based on mockMembersPage2
        expect(result.current.loading).toBeFalsy();
        expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching members', async () => {
      const errorMessage = 'Failed to load members';
      (mockMemberService.searchMembers as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<PaginatedList<MemberListDto>>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchMembers(query, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockMemberService.searchMembers).toHaveBeenCalledWith(query);
      expect(result.current.members).toEqual([]); // Initial state, not updated
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching members', async () => {
      const errorMessage = 'Server issue';
      (mockMemberService.searchMembers as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchMembers(query, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockMemberService.searchMembers).toHaveBeenCalledWith(query);
      expect(result.current.members).toEqual([]);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should reset the store state', async () => {
    // First, set some data to be able to reset
    (mockMemberService.getMemberById as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockMemberDetail,
    } as Result<MemberDetailDto>);

    (mockMemberService.searchMembers as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockMembersPage1,
    } as Result<PaginatedList<MemberListDto>>);

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.getMemberById('member1', 'family123');
      result.current.fetchMembers({ familyId: 'family123', page: 1, itemsPerPage: 10 }, false);
    });
    await waitForNextUpdate(); // Wait for data to be fetched

    expect(result.current.member).toEqual(mockMemberDetail);
    expect(result.current.members).toEqual(mockMembersPage1.items);
    expect(result.current.loading).toBeFalsy();

    // Now, reset the store
    act(() => {
      result.current.reset();
    });

    expect(result.current.member).toBeNull();
    expect(result.current.members).toEqual([]);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBeTruthy();
  });

  it('should set an error message', () => {
    const { result } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.setError('Custom error message');
    });

    expect(result.current.error).toBe('Custom error message');
  });
});
