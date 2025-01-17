import { User } from '@/types/user';
import { api } from './api';

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface TokenResponse {
  token: string;
}

interface AuthError {
  message: string;
  code: string;
}

class AuthService {
  private setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private clearAuthToken(): void {
    localStorage.removeItem('token');
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      this.setAuthToken(response.data.token);
      return response.data.user;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/register', data);
      this.setAuthToken(response.data.token);
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
      this.clearAuthToken();
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      return response.data.user;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const response = await api.put<{ user: User }>(`/auth/users/${userId}`, updates);
      return response.data.user;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/auth/password-reset/request', { email });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await api.post('/auth/password-reset/confirm', { token, password });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post('/auth/verify-email', { token });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async sendVerificationEmail(): Promise<void> {
    try {
      await api.post('/auth/send-verification');
    } catch (err) {
      throw this.handleError(err);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

export const authService = new AuthService();
