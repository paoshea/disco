import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types/user';
import { authService } from '@/services/api/auth.service';

interface RegisterData {
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
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
    const errorMessage = err instanceof Error 
      ? err.message 
      : `An error occurred during ${operation.toLowerCase()}.`;
    setError(errorMessage);
    throw err;
  };

  const login = async (email: string, password: string) => {
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

  const signup = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.register(data);
      setUser(userData);
    } catch (err) {
      handleAuthError(err, 'Signup');
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

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.requestPasswordReset(email);
    } catch (err) {
      handleAuthError(err, 'Password reset');
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
    signup,
    updateProfile,
    resetPassword,
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
