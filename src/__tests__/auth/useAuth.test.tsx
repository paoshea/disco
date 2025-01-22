import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { mockUser } from '../__mocks__/user';
import { mockSession } from '../__mocks__/next-auth';
import { signIn, signOut, useSession } from 'next-auth/react';
import apiClient from '@/services/api/api.client';

jest.mock('next-auth/react');

// Mock API client
jest.mock('@/services/api/api.client', () => {
  return {
    __esModule: true,
    default: {
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    },
  };
});

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to unauthenticated state
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  it('should initialize with no session', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should initialize with existing session', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });
    
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle successful login', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    (signIn as jest.Mock).mockResolvedValue({
      ok: true,
      error: null,
    });

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login(credentials);
    });

    expect(signIn).toHaveBeenCalledWith('credentials', {
      ...credentials,
      redirect: false,
    });
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle failed login', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    (signIn as jest.Mock).mockResolvedValue({
      ok: false,
      error: 'Invalid credentials',
    });

    const { result } = renderHook(() => useAuth());

    let error;
    await act(async () => {
      error = await result.current.login(credentials);
    });

    expect(error).toBeDefined();
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle logout', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(signOut).toHaveBeenCalled();
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle registration', async () => {
    const registrationData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    mockApiClient.post.mockResolvedValueOnce({ data: { success: true } });

    (signIn as jest.Mock).mockResolvedValueOnce({
      ok: true,
      error: null,
    });

    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register(registrationData);
    });

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', registrationData);
    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: registrationData.email,
      password: registrationData.password,
      redirect: false,
    });
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle registration failure', async () => {
    const registrationData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    mockApiClient.post.mockRejectedValueOnce(new Error('Registration failed'));

    const { result } = renderHook(() => useAuth());

    let error;
    await act(async () => {
      error = await result.current.register(registrationData);
    });

    expect(error).toBeDefined();
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });
});
