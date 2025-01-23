import { useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { login as apiLogin, logout as apiLogout } from '../../lib/api';
import type { LoginCredentials, User, RegisterCredentials } from '@/types/auth';

interface AuthResponse {
  success: boolean;
  error?: Error;
}

export function useAuth() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      await apiLogin(credentials.email, credentials.password);
      return undefined;
    } catch (error) {
      return error as Error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
      return undefined;
    } catch (error) {
      return error as Error;
    }
  }, []);

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<AuthResponse> => {
      try {
        // TODO: Implement registration
        return { success: true };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    []
  );

  const updateProfile = useCallback(
    async (data: Partial<User>): Promise<AuthResponse> => {
      try {
        // TODO: Implement profile update
        return { success: true };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    []
  );

  const sendVerificationEmail = useCallback(async (): Promise<AuthResponse> => {
    try {
      // TODO: Implement send verification email
      return { success: true };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }, []);

  const resetPassword = useCallback(
    async (token: string, password: string): Promise<AuthResponse> => {
      try {
        // TODO: Implement reset password
        return { success: true };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    []
  );

  const requestPasswordReset = useCallback(
    async (email: string): Promise<AuthResponse> => {
      try {
        // TODO: Implement request password reset
        return { success: true };
      } catch (error) {
        return { success: false, error: error as Error };
      }
    },
    []
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    sendVerificationEmail,
    resetPassword,
    requestPasswordReset,
  };
}
