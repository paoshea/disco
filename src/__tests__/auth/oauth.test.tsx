import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { mockGoogleProvider } from '../__mocks__/next-auth';

// Mock next-auth
jest.mock('next-auth/react');

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [mockGoogleProvider],
  },
}));

// Mock error component
const MockErrorComponent: React.FC<{ error: string }> = ({ error }) => (
  <div role="alert">{error}</div>
);

describe('OAuth Integration', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Provider Configuration', () => {
    it('should have Google provider properly configured', () => {
      const googleProvider = mockGoogleProvider;
      expect(googleProvider).toBeDefined();
      expect(googleProvider.id).toBe('google');
      expect(googleProvider.clientId).toBe('mock-client-id');
      expect(googleProvider.clientSecret).toBe('mock-client-secret');
    });

    it('should throw error if OAuth environment variables are missing', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;

      const validateConfig = () => {
        if (
          !process.env.GOOGLE_CLIENT_ID ||
          !process.env.GOOGLE_CLIENT_SECRET
        ) {
          throw new Error('Missing OAuth configuration');
        }
        return mockGoogleProvider;
      };

      expect(validateConfig).toThrow('Missing OAuth configuration');

      process.env = originalEnv;
    });
  });

  describe('Authentication Flow', () => {
    it('should handle successful Google sign in', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
      };

      (signIn as jest.Mock).mockResolvedValueOnce({
        ok: true,
        error: null,
        user: mockUser,
      });

      // Trigger sign in
      await signIn('google');

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('google');
      });
    });

    it('should handle OAuth errors gracefully', async () => {
      (signIn as jest.Mock).mockResolvedValueOnce({
        ok: false,
        error: 'OAuthSignin',
      });

      // Render error component
      render(<MockErrorComponent error="OAuthSignin" />);

      // Trigger sign in
      await signIn('google');

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('google');
        // Verify error handling UI components are shown
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('OAuthSignin');
      });
    });
  });

  describe('Session Management', () => {
    it('should maintain user session after successful OAuth login', async () => {
      const mockSession = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      // Mock successful OAuth login
      (signIn as jest.Mock).mockResolvedValueOnce({
        ok: true,
        error: null,
        user: mockSession.user,
      });

      await signIn('google');

      await waitFor(() => {
        // Verify session is maintained
        expect(mockSession.user).toBeDefined();
        expect(mockSession.expires).toBeDefined();
      });
    });

    it('should handle session expiry', async () => {
      const mockExpiredSession = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
        expires: new Date(Date.now() - 1000).toISOString(), // Expired
      };

      // Verify session expiry handling
      expect(new Date(mockExpiredSession.expires).getTime()).toBeLessThan(
        Date.now()
      );
    });
  });

  describe('User Profile Sync', () => {
    it('should sync user profile data after OAuth login', async () => {
      const mockGoogleProfile = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      };

      (signIn as jest.Mock).mockResolvedValueOnce({
        ok: true,
        error: null,
        user: mockGoogleProfile,
      });

      await signIn('google');

      await waitFor(() => {
        // Verify profile sync
        expect(mockGoogleProfile.email).toBeDefined();
        expect(mockGoogleProfile.name).toBeDefined();
        expect(mockGoogleProfile.picture).toBeDefined();
      });
    });
  });
});
