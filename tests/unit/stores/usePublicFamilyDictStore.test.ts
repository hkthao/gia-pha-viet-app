import { act, renderHook } from '@testing-library/react-hooks';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { createPublicFamilyDictStore, PublicFamilyDictStore } from '@/stores/usePublicFamilyDictStore';
import { IFamilyDictService } from '@/services';
import { FamilyDictDto, PaginatedList, FamilyDictFilter, Result } from '@/types';

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

describe('usePublicFamilyDictStore', () => {
  let mockFamilyDictService: IFamilyDictService;
  let useStore: UseBoundStore<StoreApi<PublicFamilyDictStore>>;

  beforeEach(() => {
    mockFamilyDictService = {
      getFamilyDictById: jest.fn(),
      getFamilyDicts: jest.fn(),
    };

    const storeFactory = createPublicFamilyDictStore(mockFamilyDictService);
    useStore = create(storeFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useStore((state) => state));

    expect(result.current.familyDict).toBeNull();
    expect(result.current.familyDicts).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBeTruthy();
  });

  describe('getFamilyDictById', () => {
    it('should fetch family dict by id successfully', async () => {
      (mockFamilyDictService.getFamilyDictById as jest.Mock).mockImplementationOnce(async (id: string) => {
        await Promise.resolve(); // Simulate microtask queue
        return { isSuccess: true, value: mockFamilyDict } as Result<FamilyDictDto>;
      });

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getFamilyDictById('dict1');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.getFamilyDictById).toHaveBeenCalledWith('dict1');
      expect(result.current.familyDict).toEqual(mockFamilyDict);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching family dict by id', async () => {
      const errorMessage = 'Entry not found';
      (mockFamilyDictService.getFamilyDictById as jest.Mock).mockImplementationOnce(async (id: string) => {
        await Promise.resolve(); // Simulate microtask queue
        return { isSuccess: false, error: { message: errorMessage } } as Result<FamilyDictDto>;
      });

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getFamilyDictById('dict1');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.getFamilyDictById).toHaveBeenCalledWith('dict1');
      expect(result.current.familyDict).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching family dict by id', async () => {
      const errorMessage = 'Network error';
      (mockFamilyDictService.getFamilyDictById as jest.Mock).mockImplementationOnce(async (id: string) => {
        await Promise.resolve(); // Simulate microtask queue
        throw new Error(errorMessage);
      });

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getFamilyDictById('dict1');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.getFamilyDictById).toHaveBeenCalledWith('dict1');
      expect(result.current.familyDict).toBeNull();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('fetchFamilyDicts', () => {
    const filter: FamilyDictFilter = { searchTerm: 'relation' };
    const page = 1;
    const itemsPerPage = 10;

    it('should fetch initial family dicts successfully', async () => {
      (mockFamilyDictService.getFamilyDicts as jest.Mock).mockImplementationOnce(async (filter, page, itemsPerPage) => {
        await Promise.resolve(); // Simulate microtask queue
        return { isSuccess: true, value: mockFamilyDictsPage1 } as Result<PaginatedList<FamilyDictDto>>;
      });

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchFamilyDicts(filter, page, itemsPerPage, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.getFamilyDicts).toHaveBeenCalledWith(filter, page, itemsPerPage);
      expect(result.current.familyDicts).toEqual(mockFamilyDictsPage1.items);
      expect(result.current.totalItems).toBe(mockFamilyDictsPage1.totalItems);
      expect(result.current.page).toBe(mockFamilyDictsPage1.page);
      expect(result.current.totalPages).toBe(mockFamilyDictsPage1.totalPages);
      expect(result.current.hasMore).toBeTruthy();
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should refresh family dicts successfully', async () => {
      // Setup initial state with some data first
      (mockFamilyDictService.getFamilyDicts as jest.Mock)
        .mockImplementationOnce(async (filter, page, itemsPerPage) => {
          await Promise.resolve(); // Simulate microtask queue
          return { isSuccess: true, value: mockFamilyDictsPage1 } as Result<PaginatedList<FamilyDictDto>>;
        })
        .mockImplementationOnce(async (filter, page, itemsPerPage) => { // Mock for refresh
          await Promise.resolve(); // Simulate microtask queue
          return { isSuccess: true, value: mockFamilyDictsPage2 } as Result<PaginatedList<FamilyDictDto>>;
        });

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      await act(async () => {
        await result.current.fetchFamilyDicts(filter, page, itemsPerPage, false);
      });
      expect(result.current.familyDicts).toEqual(mockFamilyDictsPage1.items);

      // Now refresh
      act(() => {
        result.current.fetchFamilyDicts(filter, page, itemsPerPage, true); // isRefreshing = true
      });
      expect(result.current.loading).toBeTruthy();

      await waitForNextUpdate();

      expect(mockFamilyDictService.getFamilyDicts).toHaveBeenCalledWith(filter, page, itemsPerPage);
      expect(result.current.familyDicts).toEqual(mockFamilyDictsPage2.items); // Should be replaced
      expect(result.current.totalItems).toBe(mockFamilyDictsPage2.totalItems);
      expect(result.current.page).toBe(mockFamilyDictsPage2.page);
      expect(result.current.totalPages).toBe(mockFamilyDictsPage2.totalPages);
      expect(result.current.hasMore).toBeFalsy(); // Based on mockFamilyDictsPage2
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching family dicts', async () => {
      const errorMessage = 'Failed to load entries';
      (mockFamilyDictService.getFamilyDicts as jest.Mock).mockImplementationOnce(async (filter, page, itemsPerPage) => {
        await Promise.resolve(); // Simulate microtask queue
        return { isSuccess: false, error: { message: errorMessage } } as Result<PaginatedList<FamilyDictDto>>;
      });

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchFamilyDicts(filter, page, itemsPerPage, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.getFamilyDicts).toHaveBeenCalledWith(filter, page, itemsPerPage);
      expect(result.current.familyDicts).toEqual([]); // Initial state, not updated
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching family dicts', async () => {
      const errorMessage = 'Server issue';
      (mockFamilyDictService.getFamilyDicts as jest.Mock).mockImplementationOnce(async (filter, page, itemsPerPage) => {
        await Promise.resolve(); // Simulate microtask queue
        throw new Error(errorMessage);
      });

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.fetchFamilyDicts(filter, page, itemsPerPage, false);
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockFamilyDictService.getFamilyDicts).toHaveBeenCalledWith(filter, page, itemsPerPage);
      expect(result.current.familyDicts).toEqual([]);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should clear family dict', () => {
    // Set a family dict first
    act(() => {
      useStore.getState().getFamilyDictById('dict1'); // This will set familyDict
    });
    // Assuming getFamilyDictById would set it (not fully testing its effect here, but for scenario)
    act(() => {
      useStore.setState({ familyDict: mockFamilyDict });
    });

    const { result } = renderHook(() => useStore((state) => state));
    expect(result.current.familyDict).toEqual(mockFamilyDict);

    act(() => {
      result.current.clearFamilyDict();
    });

    expect(result.current.familyDict).toBeNull();
  });

  it('should reset the store state', async () => {
    // First, set some data to be able to reset
    (mockFamilyDictService.getFamilyDictById as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockFamilyDict,
    } as Result<FamilyDictDto>);

    (mockFamilyDictService.getFamilyDicts as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockFamilyDictsPage1,
    } as Result<PaginatedList<FamilyDictDto>>);

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.getFamilyDictById('dict1');
      result.current.fetchFamilyDicts({} as FamilyDictFilter, 1, 10, false);
    });
    await waitForNextUpdate(); // Wait for data to be fetched

    expect(result.current.familyDict).toEqual(mockFamilyDict);
    expect(result.current.familyDicts).toEqual(mockFamilyDictsPage1.items);
    expect(result.current.loading).toBeFalsy();

    // Now, reset the store
    act(() => {
      result.current.reset();
    });

    expect(result.current.familyDict).toBeNull();
    expect(result.current.familyDicts).toEqual([]);
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
