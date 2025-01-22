import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { mockUser } from '../mocks/user';
import { AuthProvider } from '@/contexts/AuthContext';
import { useSession } from 'next-auth/react';

// Mock the API client
const mockAxios = {
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  post: jest.fn(),
  get: jest.fn(),
};

jest.mock('@/services/api/api.client', () => ({
  apiClient: mockAxios,
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe('useAuth', () => {
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return authenticated state when session exists', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: mockUser,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.status).toBe('authenticated');
  });

  it('should return unauthenticated state when no session exists', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.status).toBe('unauthenticated');
  });

  it('should return loading state while session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.status).toBe('loading');
  });

  it('should handle sign out', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.status).toBe('unauthenticated');
  });

  it('should handle sign in', async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: 'test-token',
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.signIn({
        email: 'test@example.com',
        password: 'password',
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.status).toBe('authenticated');
  });

  it('should handle sign in error', async () => {
    mockAxios.post.mockRejectedValueOnce(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.signIn({
        email: 'test@example.com',
        password: 'wrong-password',
      });
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.status).toBe('unauthenticated');
  });
});
