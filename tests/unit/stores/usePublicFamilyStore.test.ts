import { act, renderHook } from '@testing-library/react-hooks';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { createPublicFamilyStore, PublicFamilyStore } from '@/stores/usePublicFamilyStore';
import { IFamilyService } from '@/services';
import { FamilyDetailDto, FamilyListDto, PaginatedList, Result } from '@/types';

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

// Mock Family data for testing
const mockFamilyDetail: FamilyDetailDto = {
  id: 'family1',
  name: 'Nguyen Family',
  code: 'NGUYEN001',
  description: 'The main branch of the Nguyen family.',
  address: '123 Main St',
  avatarUrl: 'http://example.com/avatar.png',
  visibility: 'Public',
  totalMembers: 50,
  totalGenerations: 5,
  familyUsers: [],
  created: '2023-01-01T00:00:00Z',
};

const mockFamilyList: FamilyListDto = {
  id: 'family1',
  name: 'Nguyen Family',
  description: 'The main branch of the Nguyen family.',
  address: '123 Main St',
  avatarUrl: 'http://example.com/avatar.png',
  totalMembers: 50,
  totalGenerations: 5,
  visibility: 'Public',
  created: '2023-01-01T00:00:00Z',
};

const mockFamiliesPage1: PaginatedList<FamilyListDto> = {
  items: [
    { ...mockFamilyList, id: 'familyA', name: 'Family A' },
    { ...mockFamilyList, id: 'familyB', name: 'Family B' },
  ],
  page: 1,
  totalItems: 20,
  totalPages: 2,
};

const mockFamiliesPage2: PaginatedList<FamilyListDto> = {
  items: [
    { ...mockFamilyList, id: 'familyC', name: 'Family C' },
    { ...mockFamilyList, id: 'familyD', name: 'Family D' },
  ],
  page: 2,
  totalItems: 20,
  totalPages: 2,
};

const mockFamiliesSinglePage: PaginatedList<FamilyListDto> = {
  items: [
    { ...mockFamilyList, id: 'familySingle1', name: 'Family Single 1' },
  ],
  page: 1,
  totalItems: 1,
  totalPages: 1,
};


describe('usePublicFamilyStore', () => {
  let mockFamilyService: IFamilyService;
  let useStore: UseBoundStore<StoreApi<PublicFamilyStore>>;

  beforeEach(() => {
    mockFamilyService = {
      getFamilyById: jest.fn(),
      searchFamilies: jest.fn(),
      // Add other methods if IFamilyService has them and they are used by the store
    };

    const storeFactory = createPublicFamilyStore(mockFamilyService);
    useStore = create(storeFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useStore((state) => state));

    expect(result.current.family).toBeNull();
    expect(result.current.families).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBeTruthy();
  });

  describe('getFamilyById', () => {
    it('should fetch family by id successfully', async () => {
      (mockFamilyService.getFamilyById as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockFamilyDetail,
      } as Result<FamilyDetailDto>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getFamilyById('family1');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.getFamilyById).toHaveBeenCalledWith('family1');
      expect(result.current.family).toEqual(mockFamilyDetail);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching family by id', async () => {
      const errorMessage = 'Family not found';
      (mockFamilyService.getFamilyById as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<FamilyDetailDto>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getFamilyById('family1');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.getFamilyById).toHaveBeenCalledWith('family1');
      expect(result.current.family).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching family by id', async () => {
      const errorMessage = 'Network error';
      (mockFamilyService.getFamilyById as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getFamilyById('family1');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.getFamilyById).toHaveBeenCalledWith('family1');
      expect(result.current.family).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('fetchFamilies', () => {
    const query = { page: 1, search: 'Family Name' };

    it('should fetch initial families successfully', async () => {
      (mockFamilyService.searchFamilies as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockFamiliesPage1,
      } as Result<PaginatedList<FamilyListDto>>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchFamilies(query, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.searchFamilies).toHaveBeenCalledWith({
        page: query.page,
        itemsPerPage: 10,
        searchTerm: query.search,
      });
      expect(result.current.families).toEqual(mockFamiliesPage1.items);
      expect(result.current.totalItems).toBe(mockFamiliesPage1.totalItems);
      expect(result.current.page).toBe(mockFamiliesPage1.page);
      expect(result.current.totalPages).toBe(mockFamiliesPage1.totalPages);
      expect(result.current.hasMore).toBeTruthy();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should fetch more families successfully (isRefreshing = false)', async () => {
      // Initial fetch
      (mockFamilyService.searchFamilies as jest.Mock)
        .mockResolvedValueOnce({ isSuccess: true, value: mockFamiliesPage1 })
        .mockResolvedValueOnce({ isSuccess: true, value: mockFamiliesPage2 });

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      await act(async () => {
        await result.current.fetchFamilies(query, false); // First page
      });

      expect(result.current.families).toEqual(mockFamiliesPage1.items);
      expect(result.current.page).toBe(1);

      // Fetch second page
      act(() => {
        result.current.fetchFamilies({ page: 2, search: 'Family Name' }, false); // Use page 2 for next call
      });
      expect(result.current.loading).toBeTruthy();

      await waitForNextUpdate();

      expect(mockFamilyService.searchFamilies).toHaveBeenCalledWith({
        page: 2,
        itemsPerPage: 10,
        searchTerm: query.search,
      });
      expect(result.current.families).toEqual([...mockFamiliesPage1.items, ...mockFamiliesPage2.items]);
      expect(result.current.totalItems).toBe(mockFamiliesPage2.totalItems);
      expect(result.current.page).toBe(mockFamiliesPage2.page);
      expect(result.current.totalPages).toBe(mockFamiliesPage2.totalPages);
      expect(result.current.hasMore).toBeFalsy(); // Based on mockFamiliesPage2
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should refresh families successfully (isRefreshing = true)', async () => {
        // Setup initial state with some data first
        (mockFamilyService.searchFamilies as jest.Mock)
            .mockResolvedValueOnce({ isSuccess: true, value: mockFamiliesPage1 })
            .mockResolvedValueOnce({ isSuccess: true, value: mockFamiliesPage2 }); // Mock for refresh

        const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

        await act(async () => {
            await result.current.fetchFamilies(query, false);
        });
        expect(result.current.families).toEqual(mockFamiliesPage1.items);
        expect(result.current.page).toBe(1);

        // Now refresh
        act(() => {
            result.current.fetchFamilies(query, true); // isRefreshing = true
        });
        expect(result.current.loading).toBeTruthy();

        await waitForNextUpdate();

        expect(mockFamilyService.searchFamilies).toHaveBeenCalledWith({
            page: 1, // When refreshing, it should always fetch the first page
            itemsPerPage: 10,
            searchTerm: query.search,
        });
        expect(result.current.families).toEqual(mockFamiliesPage2.items); // Should be replaced with refresh data
        expect(result.current.totalItems).toBe(mockFamiliesPage2.totalItems);
        expect(result.current.page).toBe(mockFamiliesPage2.page);
        expect(result.current.totalPages).toBe(mockFamiliesPage2.totalPages);
        expect(result.current.hasMore).toBeFalsy(); // Based on mockFamiliesPage2
        expect(result.current.loading).toBeFalsy();
        expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching families', async () => {
      const errorMessage = 'Failed to load families';
      (mockFamilyService.searchFamilies as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<PaginatedList<FamilyListDto>>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchFamilies(query, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.searchFamilies).toHaveBeenCalledWith({
        page: query.page,
        itemsPerPage: 10,
        searchTerm: query.search,
      });
      expect(result.current.families).toEqual([]); // Initial state, not updated
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching families', async () => {
      const errorMessage = 'Server issue';
      (mockFamilyService.searchFamilies as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchFamilies(query, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.searchFamilies).toHaveBeenCalledWith({
        page: query.page,
        itemsPerPage: 10,
        searchTerm: query.search,
      });
      expect(result.current.families).toEqual([]);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should correctly set hasMore to false when totalPages is 1', async () => {
      (mockFamilyService.searchFamilies as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockFamiliesSinglePage,
      } as Result<PaginatedList<FamilyListDto>>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchFamilies(query, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.searchFamilies).toHaveBeenCalledWith({
        page: query.page,
        itemsPerPage: 10,
        searchTerm: query.search,
      });
      expect(result.current.families).toEqual(mockFamiliesSinglePage.items);
      expect(result.current.totalItems).toBe(mockFamiliesSinglePage.totalItems);
      expect(result.current.page).toBe(mockFamiliesSinglePage.page);
      expect(result.current.totalPages).toBe(mockFamiliesSinglePage.totalPages);
      expect(result.current.hasMore).toBeFalsy(); // This is the key assertion
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });
  });

  it('should clear family', () => {
    // Set a family first
    act(() => {
      useStore.setState({ family: mockFamilyDetail });
    });

    const { result } = renderHook(() => useStore((state) => state));
    expect(result.current.family).toEqual(mockFamilyDetail);

    act(() => {
      result.current.clearFamily();
    });

    expect(result.current.family).toBeNull();
  });

  it('should reset the store state', async () => {
    // First, set some data to be able to reset
    (mockFamilyService.getFamilyById as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockFamilyDetail,
    } as Result<FamilyDetailDto>);

    (mockFamilyService.searchFamilies as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockFamiliesPage1,
    } as Result<PaginatedList<FamilyListDto>>);

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.getFamilyById('family1');
      result.current.fetchFamilies({ page: 1, search: 'test' }, false);
    });
    await waitForNextUpdate(); // Wait for data to be fetched

    expect(result.current.family).toEqual(mockFamilyDetail);
    expect(result.current.families).toEqual(mockFamiliesPage1.items);
    expect(result.current.loading).toBeFalsy();

    // Now, reset the store
    act(() => {
      result.current.reset();
    });

    expect(result.current.family).toBeNull();
    expect(result.current.families).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(0);
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
