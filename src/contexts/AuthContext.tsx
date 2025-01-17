import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user';
import { authService } from '@/services/api/auth.service';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: Partial<User>) => Promise<void>;
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

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { token, user: userData } = await authService.login(email, password);
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred during login.'
      );
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
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred during logout.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const { token, user: newUser } = await authService.signup(userData);
      localStorage.setItem('token', token);
      setUser(newUser);
    } catch (err) {
      console.error('Signup error:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred during signup.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while updating profile.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword(email);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while resetting password.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, signup, updateProfile, resetPassword }}
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
