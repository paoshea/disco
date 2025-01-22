import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback, useEffect } from 'react';
import { apiClient } from '@/services/api/api.client';
import type { User } from '@/types/user';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user ? (session.user as User) : null;
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  useEffect(() => {
    // Add axios interceptor to handle token expiration
    if (apiClient?.interceptors?.response) {
      const interceptor = apiClient.interceptors.response.use(
        response => response,
        error => {
          if (error.response?.status === 401) {
            signOut();
          }
          return Promise.reject(error);
        }
      );

      return () => {
        apiClient.interceptors.response.eject(interceptor);
      };
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error(result?.error || 'Login failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        return error;
      }
      return new Error('Login failed');
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut();
  }, []);

  const register = useCallback(async (data: RegistrationData) => {
    try {
      const { firstName, lastName, ...rest } = data;
      await apiClient.post('/auth/register', {
        ...rest,
        name: `${firstName} ${lastName}`,
      });
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Registration failed' };
    }
  }, []);

  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    try {
      await apiClient.post('/auth/reset-password', data);
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Password reset failed' };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      await apiClient.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Failed to request password reset' };
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    resetPassword,
    requestPasswordReset,
  };
}
