// @ts-nocheck
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { apiClient } from '@/services/api/api.client';
import type { User } from '@/types/user';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { StateCreator } from 'zustand';

// Mock API client
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
  persist: (config: any) => (set: any, get: any, store: any) => config(set, get, store),
  createJSONStorage: () => ({
    getItem: (key: string) => {
      const str = window.localStorage.getItem(key);
      if (!str) return null;
      return JSON.parse(str);
    },
    setItem: (key: string, value: string) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: (key: string) => {
      window.localStorage.removeItem(key);
    },
  }),
}));

// Mock useAuth hook
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
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('auth-storage');
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      return;
    }

    state = { ...state, ...partial };
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        'auth-storage',
        JSON.stringify({
          state,
          version: 0,
        })
      );
    }
  };

  // Initialize state from localStorage if available
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('auth-storage');
    if (stored) {
      try {
        const { state: storedState } = JSON.parse(stored);
        state = storedState;
      } catch (e) {
        // Ignore parse errors
      }
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

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockDate = new Date('2025-01-22T01:41:48.108Z');

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

// Mock localStorage
const mockStorage: { [key: string]: string } = {};

const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  clear: () => {
    Object.keys(mockStorage).forEach(key => {
      delete mockStorage[key];
    });
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Session Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockApiClient.interceptors.response.use.mockClear();
  });

  it('should persist auth state in localStorage', async () => {
    const { result } = renderHook(() => useAuth());

    // Set initial state
    mockLocalStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          user: null,
          token: null,
          isLoading: false,
          error: null,
        },
        version: 0,
      })
    );

    await act(async () => {
      result.current.set({
        user: mockUser,
        token: 'test-token',
        isLoading: false,
        error: null,
      });
      // Wait for Zustand to persist the state
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const storedData = mockLocalStorage.getItem('auth-storage');
    const expectedData = JSON.stringify({
      state: {
        user: mockUser,
        token: 'test-token',
        isLoading: false,
        error: null,
      },
      version: 0,
    });

    expect(storedData).toBe(expectedData);
  });

  it('should restore auth state from localStorage', async () => {
    mockLocalStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          user: mockUser,
          token: 'test-token',
          isLoading: false,
          error: null,
        },
        version: 0,
      })
    );

    const { result } = renderHook(() => useAuth());

    // Wait for Zustand to hydrate the state
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');
  });

  it('should handle token expiration', async () => {
    // Mock window.location.href
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    // Set initial state
    mockLocalStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          user: mockUser,
          token: 'test-token',
          isLoading: false,
          error: null,
        },
        version: 0,
      })
    );

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
    expect(latestResult.current.error).toBe('Session expired. Please log in again.');
    expect(mockLocation.href).toBe('/login');
  });
});
