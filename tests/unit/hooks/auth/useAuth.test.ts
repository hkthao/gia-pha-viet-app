import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import { useAuth } from '@/hooks/auth';
import { authService } from '@/services/authService';

// Mock authService
jest.mock('@/services/authService', () => ({
  authService: {
    initSession: jest.fn(),
    isAuthenticated: jest.fn(),
    getUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should initialize with isLoadingAuth true, then become false', async () => {
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false);
    (authService.getUser as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoadingAuth).toBe(true);

    await waitFor(() => expect(result.current.isLoadingAuth).toBe(false));

    expect(authService.initSession).toHaveBeenCalledTimes(1);
    expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(authService.getUser).not.toHaveBeenCalled();
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('should be authenticated on initial load if session is valid', async () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      picture: 'http://example.com/avatar.png',
      sub: 'auth0|12345',
    };
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getUser as jest.Mock).mockReturnValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoadingAuth).toBe(false));

    expect(authService.initSession).toHaveBeenCalledTimes(1);
    expect(authService.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(authService.getUser).toHaveBeenCalledTimes(1);
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user).toEqual({
      fullName: mockUser.name,
      email: mockUser.email,
      avatarUrl: mockUser.picture,
      sub: mockUser.sub,
    });
  });

  it('login should update state on success', async () => {
    const mockUser = {
      name: 'Logged In User',
      email: 'loggedin@example.com',
      picture: 'http://example.com/loggedin.png',
      sub: 'auth0|67890',
    };
    (authService.login as jest.Mock).mockResolvedValue(true);
    (authService.getUser as jest.Mock).mockReturnValue(mockUser);
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false); // Initial state

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoadingAuth).toBe(false)); // Wait for initial effect

    act(() => {
      result.current.login();
    });

    await waitFor(() => expect(result.current.isLoggedIn).toBe(true));

    expect(authService.login).toHaveBeenCalledTimes(1);
    expect(authService.getUser).toHaveBeenCalledTimes(1);
    expect(result.current.user).toEqual({
      fullName: mockUser.name,
      email: mockUser.email,
      avatarUrl: mockUser.picture,
      sub: mockUser.sub,
    });
  });

  it('login should not update state on failure', async () => {
    (authService.login as jest.Mock).mockResolvedValue(false);
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false); // Initial state

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoadingAuth).toBe(false)); // Wait for initial effect
    expect(result.current.isLoggedIn).toBe(false);

    act(() => {
      result.current.login();
    });

    // Wait for the login promise to resolve
    await waitFor(() => expect(authService.login).toHaveBeenCalledTimes(1));

    // Ensure state remains unchanged
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('logout should update state correctly', async () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      picture: 'http://example.com/avatar.png',
      sub: 'auth0|12345',
    };
    (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
    (authService.getUser as jest.Mock).mockReturnValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoadingAuth).toBe(false)); // Wait for initial effect
    expect(result.current.isLoggedIn).toBe(true); // Should be logged in initially

    act(() => {
      result.current.logout();
    });

    await waitFor(() => expect(authService.logout).toHaveBeenCalledTimes(1));

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBe(null);
  });
});