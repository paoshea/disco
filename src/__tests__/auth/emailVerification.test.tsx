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
  role: 'user' as const,
  streakCount: 0,
  emailVerified: false,
  name: 'Test User',
  lastActive: new Date(),
  verificationStatus: 'pending' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Email Verification', () => {
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

  it('should send verification email successfully', async () => {
    const { result } = renderHook(() => useAuth());

    // Set initial auth state
    act(() => {
      result.current.set({
        user: mockUser,
        token: 'test-token',
      });
    });

    mockApiClient.post.mockResolvedValueOnce({
      data: {
        success: true,
      },
    });

    await act(async () => {
      const response = await result.current.sendVerificationEmail();
      expect(response.success).toBe(true);
      expect(response.error).toBeUndefined();
    });

    expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/send-verification-email', {}, {
      headers: {
        Authorization: 'Bearer test-token',
      },
    });
  });

  it('should handle verification email sending failure', async () => {
    const { result } = renderHook(() => useAuth());
    const errorMessage = 'Failed to send verification email';

    // Set initial auth state
    act(() => {
      result.current.set({
        user: mockUser,
        token: 'test-token',
      });
    });

    mockApiClient.post.mockRejectedValueOnce(new Error(errorMessage));

    await act(async () => {
      const response = await result.current.sendVerificationEmail();
      expect(response.success).toBe(false);
      expect(response.error).toBe(errorMessage);
    });
  });

  it('should verify email with valid token', async () => {
    const { result } = renderHook(() => useAuth());
    const verificationToken = 'valid-token';

    // Set initial auth state
    act(() => {
      result.current.set({
        user: mockUser,
        token: 'test-token',
      });
    });

    const verifiedUser = {
      ...mockUser,
      emailVerified: true,
      verificationStatus: 'verified' as const,
    };

    mockApiClient.post.mockResolvedValueOnce({
      data: {
        user: verifiedUser,
      },
    });

    await act(async () => {
      const response = await result.current.verifyEmail(verificationToken);
      expect(response.success).toBe(true);
      expect(response.error).toBeUndefined();
    });

    expect(result.current.user?.emailVerified).toBe(true);
    expect(result.current.user?.verificationStatus).toBe('verified');
  });

  it('should handle invalid verification token', async () => {
    const { result } = renderHook(() => useAuth());
    const invalidToken = 'invalid-token';
    const errorMessage = 'Invalid or expired verification token';

    // Set initial auth state
    act(() => {
      result.current.set({
        user: mockUser,
        token: 'test-token',
      });
    });

    mockApiClient.post.mockRejectedValueOnce(new Error(errorMessage));

    await act(async () => {
      const response = await result.current.verifyEmail(invalidToken);
      expect(response.success).toBe(false);
      expect(response.error).toBe(errorMessage);
    });

    expect(result.current.user?.emailVerified).toBe(false);
    expect(result.current.user?.verificationStatus).toBe('pending');
  });

  it('should handle expired verification token', async () => {
    const { result } = renderHook(() => useAuth());
    const expiredToken = 'expired-token';
    const errorMessage = 'Verification token has expired';

    // Set initial auth state
    act(() => {
      result.current.set({
        user: mockUser,
        token: 'test-token',
      });
    });

    mockApiClient.post.mockRejectedValueOnce(new Error(errorMessage));

    await act(async () => {
      const response = await result.current.verifyEmail(expiredToken);
      expect(response.success).toBe(false);
      expect(response.error).toBe(errorMessage);
    });

    expect(result.current.user?.emailVerified).toBe(false);
    expect(result.current.user?.verificationStatus).toBe('pending');
  });
});
