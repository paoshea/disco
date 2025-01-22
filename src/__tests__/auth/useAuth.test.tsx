import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { apiClient } from '@/services/api/api.client';

// Mock API client
jest.mock('@/services/api/api.client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockUser = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  streakCount: 0,
  emailVerified: false,
  name: 'Test User',
  lastActive: new Date(),
  verificationStatus: 'pending' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    // Reset auth state
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.set({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    });
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful login', async () => {
    mockApiClient.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: 'test-token',
        needsVerification: false,
        expiresIn: 3600,
      },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'password');
      expect(loginResult.success).toBe(true);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockApiClient.post.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'wrong-password');
      expect(loginResult.error).toBe(errorMessage);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle logout', async () => {
    // First login
    mockApiClient.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: 'test-token',
        needsVerification: false,
        expiresIn: 3600,
      },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    // Then logout
    mockApiClient.delete.mockResolvedValueOnce({});

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle registration', async () => {
    mockApiClient.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: 'test-token',
        needsVerification: true,
        expiresIn: 3600,
      },
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const registerResult = await result.current.register({
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(registerResult.success).toBe(true);
      expect(registerResult.needsVerification).toBe(true);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
