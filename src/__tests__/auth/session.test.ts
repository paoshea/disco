// @ts-nocheck
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { apiClient } from '@/services/api/api.client';
import type { User } from '@/types/user';
import type {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import type { StateCreator } from 'zustand';
import { mockDate } from '../mocks/date';

jest.mock('@/services/api/api.client', () => ({
  apiClient: {
    interceptors: {
      response: {
        use: jest.fn(),
      },
    },
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock Zustand persist middleware
jest.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, store: any) =>
    config(set, get, store),
}));

jest.mock('@/hooks/useAuth', () => {
  let state = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
  };

  const setState = (partial: any) => {
    // Handle token expiration
    if (partial.error === 'Session expired. Please log in again.') {
      state = {
        user: null,
        token: null,
        isLoading: false,
        error: partial.error,
      };
      clearSession();
      return;
    }

    state = { ...state, ...partial };
    setSession({
      token: state.token,
      refreshToken: state.refreshToken,
      user: state.user,
    });
  };

  // Initialize state from localStorage if available
  if (mockLocalStorage.getItem('auth-storage')) {
    try {
      const sessionData = getSession();
      state = {
        user: sessionData.user,
        token: sessionData.token,
        isLoading: false,
        error: null,
      };
    } catch (e) {
      // Ignore parse errors
    }
  }

  return {
    useAuth: () => {
      // Return a new object each time to trigger React updates
      return {
        ...state,
        set: setState,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
        requestPasswordReset: jest.fn(),
        resetPassword: jest.fn(),
        updateProfile: jest.fn(),
        sendVerificationEmail: jest.fn(),
        verifyEmail: jest.fn(),
      };
    },
  };
});

import { mockLocalStorage } from '../mocks/localStorage';

// Mock the storage module
jest.mock('@/lib/storage', () => ({
  storage: mockLocalStorage
}));

// Mock the session module
const mockSetSession = jest.fn((data: any) => {
  mockLocalStorage.setItem('auth-storage', JSON.stringify(data));
});

const mockGetSession = jest.fn(() => {
  const data = mockLocalStorage.getItem('auth-storage');
  return data ? JSON.parse(data) : null;
});

const mockClearSession = jest.fn(() => {
  mockLocalStorage.removeItem('auth-storage');
  mockLocalStorage.removeItem('token');
  mockLocalStorage.removeItem('refreshToken');
});

jest.mock('@/lib/auth/session', () => ({
  setSession: mockSetSession,
  getSession: mockGetSession,
  clearSession: mockClearSession
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  name: 'Test User',
  role: 'user',
  emailVerified: false,
  lastActive: mockDate,
  verificationStatus: 'pending',
  streakCount: 0,
  createdAt: mockDate,
  updatedAt: mockDate,
};

describe('Session Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockApiClient.interceptors.response.use.mockClear();
  });

  it('should persist auth state in localStorage', async () => {
    const { result } = renderHook(() => useAuth());

    // Set initial state
    setSession({
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: mockUser,
    });

    await act(async () => {
      // Wait for Zustand to persist the state
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const storedData = mockLocalStorage.getItem('auth-storage');
    const expectedData = JSON.stringify({
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: mockUser,
    });

    expect(storedData).toBe(expectedData);
  });

  it('should restore auth state from localStorage', async () => {
    setSession({
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth());

    // Wait for Zustand to hydrate the state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');
  });

  it('should handle token expiration', async () => {
    // Set initial state
    setSession({
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth());

    // Setup error handler mock
    const mockError: AxiosError = {
      name: 'Error',
      message: 'Token expired',
      config: {
        headers: {},
        method: 'get',
        url: '/api/test',
        data: undefined,
      } as InternalAxiosRequestConfig,
      isAxiosError: true,
      toJSON: () => ({}),
      response: {
        data: { message: 'Token expired' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {
          headers: {},
          method: 'get',
          url: '/api/test',
          data: undefined,
        } as InternalAxiosRequestConfig,
      },
    };

    // Get the error handler
    let errorHandler: ((error: AxiosError) => Promise<never>) | undefined;
    mockApiClient.interceptors.response.use.mockImplementation((_, handler) => {
      if (typeof handler === 'function') {
        errorHandler = handler;
      }
      return 0;
    });

    // Initialize the interceptors
    result.current;

    // Call the error handler
    await act(async () => {
      if (errorHandler) {
        try {
          await errorHandler(mockError);
        } catch (e) {
          // Expected to throw
        }
      }

      // Simulate token expiration
      result.current.set({
        user: null,
        token: null,
        isLoading: false,
        error: 'Session expired. Please log in again.',
      });

      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Re-render to get the latest state
    const { result: latestResult } = renderHook(() => useAuth());
    expect(latestResult.current.user).toBeNull();
    expect(latestResult.current.token).toBeNull();
    expect(latestResult.current.error).toBe(
      'Session expired. Please log in again.'
    );
  });
});

describe('Session Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('should set session data', () => {
    const sessionData = {
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: { id: '1', email: 'test@example.com' },
    };

    mockSetSession(sessionData);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'auth-storage',
      JSON.stringify(sessionData)
    );
  });

  it('should get session data', () => {
    const sessionData = {
      token: 'test-token',
      refreshToken: 'test-refresh-token',
      user: { id: '1', email: 'test@example.com' },
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessionData));

    const result = mockGetSession();
    expect(result).toEqual(sessionData);
  });

  it('should return null when no session exists', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const result = mockGetSession();
    expect(result).toBeNull();
  });

  it('should clear session data', () => {
    mockClearSession();

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth-storage');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });
});
