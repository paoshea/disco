import { api } from './api';
import { User } from '@/types/user';
import { RegisterData } from '@/contexts/AuthContext';

interface LoginResponse {
  token: string;
  user: User;
}

interface AuthError {
  message: string;
  code: string;
}

class AuthService {
  private setAuthToken(token: string) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private clearAuthToken() {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const { data } = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      this.setAuthToken(data.token);
      return data.user;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(authError.message || 'Failed to login');
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const { data } = await api.post<LoginResponse>('/auth/register', userData);

      this.setAuthToken(data.token);
      return data.user;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(authError.message || 'Failed to register');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
      this.clearAuthToken();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear token on error
      this.clearAuthToken();
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const { data } = await api.post<{ token: string }>('/auth/refresh');
      this.setAuthToken(data.token);
      return data.token;
    } catch (error) {
      this.clearAuthToken();
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  }

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export const authService = new AuthService();
