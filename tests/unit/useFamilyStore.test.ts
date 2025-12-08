import { act, renderHook } from '@testing-library/react-hooks';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { createFamilyStore, FamilyStore } from '@/stores/useFamilyStore';

// Mock authService if it's imported in any way, even indirectly, by components that might use this store.
// For a simple store like useFamilyStore, it might not be strictly necessary here, but good practice if it were part of a larger context.
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

describe('useFamilyStore', () => {
  let useStore: UseBoundStore<StoreApi<FamilyStore>>;

  beforeEach(() => {
    const storeFactory = createFamilyStore();
    useStore = create(storeFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useStore((state) => state));

    expect(result.current.currentFamilyId).toBeNull();
  });

  it('should set currentFamilyId', () => {
    const { result } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.setCurrentFamilyId('family123');
    });

    expect(result.current.currentFamilyId).toBe('family123');

    act(() => {
      result.current.setCurrentFamilyId(null);
    });

    expect(result.current.currentFamilyId).toBeNull();
  });

  it('should reset the store state', () => {
    const { result } = renderHook(() => useStore((state) => state));

    act(() => {
      result.current.setCurrentFamilyId('family123');
    });

    expect(result.current.currentFamilyId).toBe('family123');

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentFamilyId).toBeNull();
  });
});
