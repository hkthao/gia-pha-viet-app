import { act, renderHook } from '@testing-library/react-hooks';
import { IFamilyDictService } from '@/services/familyDict/familyDict.service.interface';
import { usePublicFamilyDictStore } from '@/stores/usePublicFamilyDictStore';
import { FamilyDictDto, PaginatedList, FamilyDictSearchQuery, Result as TResult } from '@/types';
import { Result } from '@/utils/resultUtils'; // Import Result as a value

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

// Mock the familyDictService module that usePublicFamilyDictStore imports
const mockFamilyDictService: IFamilyDictService = {
  getById: jest.fn(),
  search: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@/services', () => ({
  ...jest.requireActual('@/services'), // Keep actual implementations for other exports
  familyDictService: mockFamilyDictService,
}));

// Mock FamilyDict data for testing
const mockFamilyDict: FamilyDictDto = {
  id: 'dict1',
  name: 'Blood Relations',
  type: 0, // FamilyDictType.Blood
  description: 'Terms related to blood relatives',
  lineage: 0, // FamilyDictLineage.Noi
  specialRelation: false,
  namesByRegion: { north: 'Ông', central: 'Ông', south: 'Ông' },
};

const mockFamilyDictsPage1: PaginatedList<FamilyDictDto> = {
  items: [
    { ...mockFamilyDict, id: 'dictA', name: 'Term A' },
    { ...mockFamilyDict, id: 'dictB', name: 'Term B' },
  ],
  page: 1,
  totalItems: 20,
  totalPages: 2,
};

const mockFamilyDictsPage2: PaginatedList<FamilyDictDto> = {
  items: [
    { ...mockFamilyDict, id: 'dictC', name: 'Term C' },
    { ...mockFamilyDict, id: 'dictD', name: 'Term D' },
  ],
  page: 2,
  totalItems: 20,
  totalPages: 2,
};

const mockFamilyDictsSinglePage: PaginatedList<FamilyDictDto> = {
  items: [
    { ...mockFamilyDict, id: 'dictSingle1', name: 'Term Single 1' },
  ],
  page: 1,
  totalItems: 1,
  totalPages: 1,
};

describe('usePublicFamilyDictStore', () => {


  it('should return initial state', () => {
    const { result } = renderHook(() => usePublicFamilyDictStore());

    expect(result.current.item).toBeNull();
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBeFalsy();
  });

  describe('getById', () => { // Renamed from getFamilyDictById
    it('should fetch family dict by id successfully', async () => {
      (mockFamilyDictService.getById as jest.Mock).mockResolvedValueOnce(
        Result.success(mockFamilyDict) as TResult<FamilyDictDto>
      );

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyDictStore());

      act(() => {
        result.current.getById('dict1'); // Renamed
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.getById).toHaveBeenCalledWith('dict1');
      expect(result.current.item).toEqual(mockFamilyDict);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching family dict by id', async () => {
      const errorMessage = 'Entry not found';
      (mockFamilyDictService.getById as jest.Mock).mockResolvedValueOnce(
        Result.fail(errorMessage) as TResult<FamilyDictDto>
      );

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyDictStore());

      act(() => {
        result.current.getById('dict1'); // Renamed
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.getById).toHaveBeenCalledWith('dict1');
      expect(result.current.item).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching family dict by id', async () => {
      const errorMessage = 'Network error';
      (mockFamilyDictService.getById as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyDictStore());

      act(() => {
        result.current.getById('dict1'); // Renamed
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.getById).toHaveBeenCalledWith('dict1');
      expect(result.current.item).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('search', () => {
    const filter: FamilyDictSearchQuery = { searchTerm: 'relation' };
    const page = 1;
    const itemsPerPage = 10;

    it('should fetch initial items successfully', async () => {
      (mockFamilyDictService.search as jest.Mock).mockResolvedValueOnce(
        Result.success(mockFamilyDictsPage1) as TResult<PaginatedList<FamilyDictDto>>
      );

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyDictStore());

      act(() => {
        result.current.search({ ...filter, page: page, itemsPerPage: itemsPerPage }, false);
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.search).toHaveBeenCalledWith({ ...filter, page: page, itemsPerPage: itemsPerPage });
      expect(result.current.items).toEqual(mockFamilyDictsPage1.items);
      expect(result.current.totalItems).toBe(mockFamilyDictsPage1.totalItems);
      expect(result.current.page).toBe(mockFamilyDictsPage1.page);
      expect(result.current.totalPages).toBe(mockFamilyDictsPage1.totalPages);
      expect(result.current.hasMore).toBeTruthy();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should refresh items successfully', async () => {
      // Setup initial state with some data first
      (mockFamilyDictService.search as jest.Mock)
        .mockResolvedValueOnce(
          Result.success(mockFamilyDictsPage1) as TResult<PaginatedList<FamilyDictDto>>
        )
        .mockResolvedValueOnce( // Mock for refresh
          Result.success(mockFamilyDictsPage2) as TResult<PaginatedList<FamilyDictDto>>
        );

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyDictStore());

      await act(async () => {
        await result.current.search({ ...filter, page: page, itemsPerPage: itemsPerPage }, false);
      });
      expect(result.current.items).toEqual(mockFamilyDictsPage1.items);

      // Now refresh
      act(() => {
        result.current.search({ ...filter, page: page, itemsPerPage: itemsPerPage }, true);
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();

      await waitForNextUpdate();

      expect(mockFamilyDictService.search).toHaveBeenCalledWith({ ...filter, page: page, itemsPerPage: itemsPerPage });
      expect(result.current.items).toEqual(mockFamilyDictsPage2.items); // Should be replaced
      expect(result.current.totalItems).toBe(mockFamilyDictsPage2.totalItems);
      expect(result.current.page).toBe(mockFamilyDictsPage2.page);
      expect(result.current.totalPages).toBe(mockFamilyDictsPage2.totalPages);
      expect(result.current.hasMore).toBeFalsy(); // Based on mockFamilyDictsPage2
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching items', async () => {
      const errorMessage = 'Failed to load entries';
      (mockFamilyDictService.search as jest.Mock).mockResolvedValueOnce(
        Result.fail(errorMessage) as TResult<PaginatedList<FamilyDictDto>>
      );

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyDictStore());

      act(() => {
        result.current.search({ ...filter, page: page, itemsPerPage: itemsPerPage }, false);
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.search).toHaveBeenCalledWith({ ...filter, page: page, itemsPerPage: itemsPerPage });
      expect(result.current.items).toEqual([]); // Initial state, not updated
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching items', async () => {
      const errorMessage = 'Server issue';
      (mockFamilyDictService.search as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyDictStore());

      act(() => {
        result.current.search({ ...filter, page: page, itemsPerPage: itemsPerPage }, false);
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.search).toHaveBeenCalledWith({ ...filter, page: page, itemsPerPage: itemsPerPage });
      expect(result.current.items).toEqual([]);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should correctly set hasMore to false when totalPages is 1', async () => {
      (mockFamilyDictService.search as jest.Mock).mockResolvedValueOnce(
        Result.success(mockFamilyDictsSinglePage) as TResult<PaginatedList<FamilyDictDto>>
      );

      const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyDictStore());

      act(() => {
        result.current.search({ ...filter, page: page, itemsPerPage: itemsPerPage }, false);
      });
      await act(async () => {}); // Allow microtasks to complete for Zustand state update
      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.search).toHaveBeenCalledWith({ ...filter, page: page, itemsPerPage: itemsPerPage });
      expect(result.current.items).toEqual(mockFamilyDictsSinglePage.items);
      expect(result.current.totalItems).toBe(mockFamilyDictsSinglePage.totalItems);
      expect(result.current.page).toBe(mockFamilyDictsSinglePage.page);
      expect(result.current.totalPages).toBe(mockFamilyDictsSinglePage.totalPages);
      expect(result.current.hasMore).toBeFalsy(); // This is the key assertion
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });
  });

  it('should clear item', () => {
    // Set an item first
    act(() => {
      usePublicFamilyDictStore.setState({ item: mockFamilyDict });
    });

    const { result } = renderHook(() => usePublicFamilyDictStore());
    expect(result.current.item).toEqual(mockFamilyDict);

    act(() => {
      result.current.clearItem();
    });

    expect(result.current.item).toBeNull();
  });

  it('should reset the store state', async () => {
    // First, set some data to be able to reset
    (mockFamilyDictService.getById as jest.Mock).mockResolvedValueOnce(Result.success(mockFamilyDict) as TResult<FamilyDictDto>);

    (mockFamilyDictService.search as jest.Mock).mockResolvedValueOnce(Result.success(mockFamilyDictsPage1) as TResult<PaginatedList<FamilyDictDto>>);

    const { result, waitForNextUpdate } = renderHook(() => usePublicFamilyDictStore());

    act(() => {
      result.current.getById('dict1');
    });
    await act(async () => {}); // Allow microtasks to complete for Zustand state update
    act(() => {
      result.current.search({ page: 1, itemsPerPage: 10 } as FamilyDictSearchQuery, false);
    });
    await act(async () => {}); // Allow microtasks to complete for Zustand state update
    await waitForNextUpdate(); // Wait for data to be fetched

    expect(result.current.item).toEqual(mockFamilyDict);
    expect(result.current.items).toEqual(mockFamilyDictsPage1.items);
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
    const { result } = renderHook(() => usePublicFamilyDictStore());

    act(() => {
      result.current.setError('Custom error message');
    });

    expect(result.current.error).toBe('Custom error message');
  });
});
