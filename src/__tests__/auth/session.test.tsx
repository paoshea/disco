import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { apiClient } from '@/services/api/api.client';
import type { User } from '@/types/user';

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

const mockDate = new Date('2025-01-22T01:41:48.108Z');

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  streakCount: 0,
  emailVerified: false,
  name: 'Test User',
  lastActive: mockDate,
  verificationStatus: 'pending' as const,
  createdAt: mockDate,
  updatedAt: mockDate,
};

const mockUserSerialized = {
  ...mockUser,
  lastActive: mockDate.toISOString(),
  createdAt: mockDate.toISOString(),
  updatedAt: mockDate.toISOString(),
};

describe('Session Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('should persist auth state in localStorage', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.set({
        user: mockUser,
        token: 'test-token',
      });
    });

    // Get stored auth state from localStorage
    const storedState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    expect(storedState.state.user).toEqual(mockUserSerialized);
    expect(storedState.state.token).toBe('test-token');
  });

  it('should restore auth state from localStorage', () => {
    // Set initial state in localStorage
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: mockUserSerialized,
        token: 'test-token',
        isLoading: false,
        error: null,
      },
      version: 0,
    }));

    const { result } = renderHook(() => useAuth());

    // Convert date strings back to Date objects for comparison
    const user = result.current.user;
    expect(user).not.toBeNull();

    if (user) {
      const userWithDates = {
        ...user,
        lastActive: new Date(user.lastActive),
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };
      expect(userWithDates).toEqual(mockUser);
    }

    expect(result.current.token).toBe('test-token');
  });

  it('should clear auth state on logout', async () => {
    const { result } = renderHook(() => useAuth());

    // Set initial state
    act(() => {
      result.current.set({
        user: mockUser,
        token: 'test-token',
      });
    });

    // Verify initial state is set
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');

    // Perform logout
    mockApiClient.delete.mockResolvedValueOnce({});
    await act(async () => {
      await result.current.logout();
    });

    // Verify state is cleared
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();

    // Verify localStorage is cleared
    const storedState = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    expect(storedState.state?.user).toBeNull();
    expect(storedState.state?.token).toBeNull();
  });

  it('should update user data without affecting token', () => {
    const { result } = renderHook(() => useAuth());

    // Set initial state
    act(() => {
      result.current.set({
        user: mockUser,
        token: 'test-token',
      });
    });

    const updatedUser = {
      ...mockUser,
      firstName: 'Updated',
      lastName: 'Name',
    };

    // Update only user data
    act(() => {
      result.current.set({
        user: updatedUser,
      });
    });

    // Verify token remains unchanged
    expect(result.current.token).toBe('test-token');
    // Verify user data is updated
    expect(result.current.user).toEqual(updatedUser);
  });

  it('should handle token expiration', async () => {
    const { result } = renderHook(() => useAuth());
    const expiredTokenError = {
      name: 'TokenExpiredError',
      message: 'Token has expired',
      response: {
        status: 401,
        data: {
          message: 'Token expired',
        },
      },
    };

    // Set initial state
    act(() => {
      result.current.set({
        user: mockUser,
        token: 'expired-token',
      });
    });

    // Mock API call with token expiration error
    mockApiClient.get.mockRejectedValueOnce(expiredTokenError);

    // Trigger the token expiration handler
    const errorHandler = mockApiClient.interceptors.response.use.mock.calls[0][1];
    if (errorHandler) {
      await errorHandler(expiredTokenError);
    }

    // Verify auth state is cleared
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.error).toBe('Session expired. Please log in again.');
  });
});
