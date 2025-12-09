import { act, renderHook } from '@testing-library/react-hooks';
import { IFamilyService } from '@/services/family/family.service.interface';
import { usePublicFamilyStore } from '@/stores/usePublicFamilyStore';
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

// Mock the familyService module that usePublicFamilyStore imports
const mockFamilyService: IFamilyService = {
  search: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@/services', () => ({
  ...jest.requireActual('@/services'), // Keep actual implementations for other exports
  familyService: mockFamilyService,
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




  it('should return initial state', () => {
    const { result } = renderHook(() => usePublicFamilyStore());

    expect(result.current.item).toBeNull();
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBeFalsy(); // Default hasMore for generic store is false
  });

  describe('getById', () => {
    it('should fetch item by id successfully', async () => {
      (mockFamilyService.getById as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockFamilyDetail,
      } as Result<FamilyDetailDto>);

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyStore());

      act(() => {
        result.current.getById('family1');
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.getById).toHaveBeenCalledWith('family1');
      expect(result.current.item).toEqual(mockFamilyDetail);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching item by id', async () => {
      const errorMessage = 'Family not found';
      (mockFamilyService.getById as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<FamilyDetailDto>);

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyStore());

      act(() => {
        result.current.getById('family1');
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.getById).toHaveBeenCalledWith('family1');
      expect(result.current.item).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching item by id', async () => {
      const errorMessage = 'Network error';
      (mockFamilyService.getById as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyStore());

      act(() => {
        result.current.getById('family1');
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.getById).toHaveBeenCalledWith('family1');
      expect(result.current.item).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('search', () => {
    const query = { page: 1, searchTerm: 'Family Name' }; // Changed 'search' to 'searchTerm' to match IGenericService Filter

    it('should fetch initial items successfully', async () => {
      (mockFamilyService.search as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockFamiliesPage1,
      } as Result<PaginatedList<FamilyListDto>>);

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyStore());

      act(() => {
        result.current.search(query, false);
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.search).toHaveBeenCalledWith({
        page: query.page,
        itemsPerPage: 10,
        searchTerm: query.searchTerm,
      });
      expect(result.current.items).toEqual(mockFamiliesPage1.items);
      expect(result.current.totalItems).toBe(mockFamiliesPage1.totalItems);
      expect(result.current.page).toBe(mockFamiliesPage1.page);
      expect(result.current.totalPages).toBe(mockFamiliesPage1.totalPages);
      expect(result.current.hasMore).toBeTruthy();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should fetch more items successfully (isRefreshing = false)', async () => {
      // Initial fetch
      (mockFamilyService.search as jest.Mock)
        .mockResolvedValueOnce({ isSuccess: true, value: mockFamiliesPage1 })
        .mockResolvedValueOnce({ isSuccess: true, value: mockFamiliesPage2 });

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyStore());

      await act(async () => {
        await result.current.search(query, false); // First page
      });

      expect(result.current.items).toEqual(mockFamiliesPage1.items);
      expect(result.current.page).toBe(1);

      // Fetch second page
      act(() => {
        result.current.search({ page: 2, searchTerm: 'Family Name' }, false); // Use page 2 for next call
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();

      await waitForNextUpdate();

      expect(mockFamilyService.search).toHaveBeenCalledWith({
        page: 2,
        itemsPerPage: 10,
        searchTerm: query.searchTerm,
      });
      expect(result.current.items).toEqual([...mockFamiliesPage1.items, ...mockFamiliesPage2.items]);
      expect(result.current.totalItems).toBe(mockFamiliesPage2.totalItems);
      expect(result.current.page).toBe(mockFamiliesPage2.page);
      expect(result.current.totalPages).toBe(mockFamiliesPage2.totalPages);
      expect(result.current.hasMore).toBeFalsy(); // Based on mockFamiliesPage2
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should refresh items successfully (isRefreshing = true)', async () => {
        // Setup initial state with some data first
        (mockFamilyService.search as jest.Mock)
            .mockResolvedValueOnce({ isSuccess: true, value: mockFamiliesPage1 })
            .mockResolvedValueOnce({ isSuccess: true, value: mockFamiliesPage2 }); // Mock for refresh

        const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyStore());

        await act(async () => {
            await result.current.search(query, false);
        });
        expect(result.current.items).toEqual(mockFamiliesPage1.items);
        expect(result.current.page).toBe(1);

        // Now refresh
        act(() => {
            result.current.search(query, true);
        });
        await act(async () => {}); // Allow microtasks to complete for Zustand state update
        expect(result.current.loading).toBeTruthy();

        await waitForNextUpdate();

        expect(mockFamilyService.search).toHaveBeenCalledWith({
            page: 1, // When refreshing, it should always fetch the first page
            itemsPerPage: 10,
            searchTerm: query.searchTerm,
        });
        expect(result.current.items).toEqual(mockFamiliesPage2.items); // Should be replaced with refresh data
        expect(result.current.totalItems).toBe(mockFamiliesPage2.totalItems);
        expect(result.current.page).toBe(mockFamiliesPage2.page);
        expect(result.current.totalPages).toBe(mockFamiliesPage2.totalPages);
        expect(result.current.hasMore).toBeFalsy(); // Based on mockFamiliesPage2
        expect(result.current.loading).toBeFalsy();
        expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching items', async () => {
      const errorMessage = 'Failed to load families';
      (mockFamilyService.search as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<PaginatedList<FamilyListDto>>);

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyStore());

      act(() => {
        result.current.search(query, false);
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.search).toHaveBeenCalledWith({
        page: query.page,
        itemsPerPage: 10,
        searchTerm: query.searchTerm,
      });
      expect(result.current.items).toEqual([]); // Initial state, not updated
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching items', async () => {
      act(() => {
        result.current.search(query, false);
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.search).toHaveBeenCalledWith({
        page: query.page,
        itemsPerPage: 10,
        searchTerm: query.searchTerm,
      });
      expect(result.current.items).toEqual([]);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should correctly set hasMore to false when totalPages is 1', async () => {
      (mockFamilyService.search as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockFamiliesSinglePage,
      } as Result<PaginatedList<FamilyListDto>>);

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyStore());

      act(() => {
        result.current.search(query, false);
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyService.search).toHaveBeenCalledWith({
        page: query.page,
        itemsPerPage: 10,
        searchTerm: query.searchTerm,
      });
      expect(result.current.items).toEqual(mockFamiliesSinglePage.items);
      expect(result.current.totalItems).toBe(mockFamiliesSinglePage.totalItems);
      expect(result.current.page).toBe(mockFamiliesSinglePage.page);
      expect(result.current.totalPages).toBe(mockFamiliesSinglePage.totalPages);
      expect(result.current.hasMore).toBeFalsy(); // This is the key assertion
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });
  });

  it('should clear item', () => {
    // Set an item first
    act(() => {
      usePublicFamilyStore.setState({ item: mockFamilyDetail });
    });

    const { result } = renderHook(() => usePublicFamilyStore());
    expect(result.current.item).toEqual(mockFamilyDetail);

    act(() => {
      result.current.clearItem();
    });

    expect(result.current.item).toBeNull();
  });

  it('should reset the store state', async () => {
    // First, set some data to be able to reset
    (mockFamilyService.getById as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockFamilyDetail,
    } as Result<FamilyDetailDto>);

    (mockFamilyService.search as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockFamiliesPage1,
    } as Result<PaginatedList<FamilyListDto>>);

    const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyStore());

    act(() => {
      result.current.getById('family1');
    });
    await act(async () => {}); // Allow microtasks to complete for Zustand state update
    act(() => {
      result.current.search({ page: 1, searchTerm: 'test' }, false);
    });
    await act(async () => {}); // Allow microtasks to complete for Zustand state update
    await waitForNextUpdate(); // Wait for data to be fetched

    expect(result.current.item).toEqual(mockFamilyDetail);
    expect(result.current.items).toEqual(mockFamiliesPage1.items);
    expect(result.current.loading).toBeFalsy();

    // Now, reset the store
    act(() => {
      result.current.reset();
    });

    expect(result.current.item).toBeNull();
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBeFalsy();
  });

  it('should set an error message', () => {
    const { result } = renderHook(() => usePublicFamilyStore());

    act(() => {
      result.current.setError('Custom error message');
    });

    expect(result.current.error).toBe('Custom error message');
  });
});
