import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/user';
import { authService } from '@/services/api/auth.service';
import { LoginResult } from '@/hooks/useAuth';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  signup: (data: RegisterData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a token before trying to get user data
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Error initializing auth:', err);
        // Clear tokens if there was an error
        if (err instanceof Error && err.message.includes('No authentication token found')) {
          authService.logout();
        }
      } finally {
        setLoading(false);
      }
    };

    void initAuth();
  }, []);

  const handleAuthError = (err: unknown, operation: string) => {
    console.error(`${operation} error:`, err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : `An error occurred during ${operation.toLowerCase()}.`;
    setError(errorMessage);
    throw err;
  };

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.login(email, password);
      setUser(result.user);
      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(data);
      setUser(response.user);
      router.push('/dashboard');
    } catch (err) {
      handleAuthError(err, 'Signup');
    } finally {
      setLoading(false);
    }
  };

  // Alias for signup to maintain backward compatibility
  const register = signup;

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
    } catch (err) {
      handleAuthError(err, 'Profile update');
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.requestPasswordReset(email);
    } catch (err) {
      handleAuthError(err, 'Password reset request');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    token: string,
    password: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(token, password);
    } catch (err) {
      handleAuthError(err, 'Password reset');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        signup,
        register,
        updateProfile,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
