import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types/user';
import { authService } from '@/services/api/auth.service';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: RegisterData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while initializing authentication.'
        );
      } finally {
        setLoading(false);
      }
    };

    void initAuth();
  }, []);

  const handleAuthError = (err: unknown, operation: string) => {
    console.error(`${operation} error:`, err);
    const errorMessage =
      err instanceof Error ? err.message : `An error occurred during ${operation.toLowerCase()}.`;
    setError(errorMessage);
    throw err;
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.login(email, password);
      setUser(userData);
    } catch (err) {
      handleAuthError(err, 'Login');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(data);
      setUser(response.user);
      localStorage.setItem('token', response.token);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (err) {
      handleAuthError(err, 'Logout');
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
      console.error('Password reset request error:', err);
      setError(err instanceof Error ? err.message : 'Failed to request password reset');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(token, password);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.verifyEmail(token);
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Email verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await authService.sendVerificationEmail();
    } catch (err) {
      console.error('Send verification email error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.id) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateUser(user.id, updates);
      setUser(updatedUser);
    } catch (err) {
      handleAuthError(err, 'Profile update');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    signup: register,
    register,
    updateProfile,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    sendVerificationEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
