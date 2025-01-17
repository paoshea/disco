import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types/user';
import { authService } from '@/services/api/auth.service';
import { userService } from '@/services/api/user.service';
import type { RegisterData } from '@/hooks/useAuth';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      if (!authService.isAuthenticated()) {
        setUser(null);
        return;
      }

      const userData = await userService.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Error loading user:', err);
      setUser(null);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.login(email, password);
      await loadUser();
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadUser]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.register(data);
      await login(data.email, data.password);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      setIsLoading(true);
      setError(null);
      const updatedUser = await userService.updateProfile(user.id, data);
      setUser(updatedUser);
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.resetPassword(email);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send password reset email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.verifyEmail(token);
      await loadUser();
    } catch (err) {
      console.error('Email verification error:', err);
      setError('Failed to verify email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadUser]);

  const sendVerificationEmail = useCallback(async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      setIsLoading(true);
      setError(null);
      await authService.sendVerificationEmail(user.id);
    } catch (err) {
      console.error('Send verification email error:', err);
      setError('Failed to send verification email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile,
    resetPassword,
    verifyEmail,
    sendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
