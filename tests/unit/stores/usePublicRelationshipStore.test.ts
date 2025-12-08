import { act, renderHook } from '@testing-library/react-hooks';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { createPublicRelationshipStore, PublicRelationshipStore } from '@/stores/usePublicRelationshipStore';
import { IRelationshipService } from '@/services';
import { RelationshipListDto, Result, RelationshipType } from '@/types';

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

// Mock Relationship data for testing
const mockRelationship1: RelationshipListDto = {
  id: 'rel1',
  sourceMemberId: 'member1',
  targetMemberId: 'member2',
  type: RelationshipType.Father,
  order: 1,
  startDate: '2000-01-01T00:00:00Z',
  sourceMember: { id: 'member1', fullName: 'Member One', isRoot: false },
  targetMember: { id: 'member2', fullName: 'Member Two', isRoot: false },
};

const mockRelationship2: RelationshipListDto = {
  id: 'rel2',
  sourceMemberId: 'member3',
  targetMemberId: 'member4',
  type: RelationshipType.Wife,
  order: 1,
  startDate: '2005-05-05T00:00:00Z',
  sourceMember: { id: 'member3', fullName: 'Member Three', isRoot: false },
  targetMember: { id: 'member4', fullName: 'Member Four', isRoot: false },
};

const mockRelationships: RelationshipListDto[] = [mockRelationship1, mockRelationship2];

describe('usePublicRelationshipStore', () => {
  let mockRelationshipService: IRelationshipService;
  let useStore: UseBoundStore<StoreApi<PublicRelationshipStore>>;

  beforeEach(() => {
    mockRelationshipService = {
      getRelationshipsByFamilyId: jest.fn(),
    };

    const storeFactory = createPublicRelationshipStore(mockRelationshipService);
    useStore = create(storeFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useStore((state) => state));

    expect(result.current.relationships).toEqual([]);
    expect(result.current.loading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  describe('getRelationshipsByFamilyId', () => {
    it('should fetch relationships successfully', async () => {
      (mockRelationshipService.getRelationshipsByFamilyId as jest.Mock).mockResolvedValueOnce({
        isSuccess: true,
        value: mockRelationships,
      } as Result<RelationshipListDto[]>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getRelationshipsByFamilyId('family123');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockRelationshipService.getRelationshipsByFamilyId).toHaveBeenCalledWith('family123');
      expect(result.current.relationships).toEqual(mockRelationships);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBeNull();
    });

    it('should handle API error when fetching relationships', async () => {
      const errorMessage = 'Failed to fetch relationships';
      (mockRelationshipService.getRelationshipsByFamilyId as jest.Mock).mockResolvedValueOnce({
        isSuccess: false,
        error: { message: errorMessage },
      } as Result<RelationshipListDto[]>);

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getRelationshipsByFamilyId('family123');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockRelationshipService.getRelationshipsByFamilyId).toHaveBeenCalledWith('family123');
      expect(result.current.relationships).toEqual([]);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });

    it('should handle thrown error when fetching relationships', async () => {
      const errorMessage = 'Network error';
      (mockRelationshipService.getRelationshipsByFamilyId as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

      act(() => {
        result.current.getRelationshipsByFamilyId('family123');
      });

      expect(result.current.loading).toBeTruthy();
      expect(result.current.error).toBeNull();

      await waitForNextUpdate();

      expect(mockRelationshipService.getRelationshipsByFamilyId).toHaveBeenCalledWith('family123');
      expect(result.current.relationships).toEqual([]);
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should clear relationships', () => {
    act(() => {
      useStore.setState({ relationships: mockRelationships });
    });

    const { result } = renderHook(() => useStore((state) => state));
    expect(result.current.relationships).toEqual(mockRelationships);

    act(() => {
      result.current.clearRelationships();
    });

    expect(result.current.relationships).toEqual([]);
  });

  it('should reset the store state', async () => {
    // First, set some data to be able to reset
    (mockRelationshipService.getRelationshipsByFamilyId as jest.Mock).mockResolvedValueOnce({
      isSuccess: true,
      value: mockRelationships,
    } as Result<RelationshipListDto[]>);

    const { result, waitForNextUpdate } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.getRelationshipsByFamilyId('family123');
    });
    await waitForNextUpdate(); // Wait for data to be fetched

    expect(result.current.relationships).toEqual(mockRelationships);
    expect(result.current.loading).toBeFalsy();

    // Now, reset the store
    act(() => {
      result.current.reset();
    });

    expect(result.current.relationships).toEqual([]);
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
