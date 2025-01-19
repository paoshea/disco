import { User } from '@/types/user';
import { apiClient } from './api.client';
import type { AxiosError } from 'axios';

interface AuthResponse {
  user: User;
  token: string;
  expiresIn?: number;
  message?: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

class AuthService {
  private readonly baseUrl = '/api/auth';

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.baseUrl}/login`,
        {
          email,
          password,
        }
      );
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid email or password');
        }
        if (error.response?.status === 404) {
          throw new Error(
            'Login service is not available. Please try again later.'
          );
        }
      }
      throw error;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.baseUrl}/signup`,
        data
      );
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new Error('User already exists');
        }
        if (error.response?.status === 404) {
          throw new Error(
            'Registration service is not available. Please try again later.'
          );
        }
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>(`${this.baseUrl}/me`);
      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear it
          localStorage.removeItem('token');
          throw new Error('Your session has expired. Please log in again.');
        }
        if (error.response?.status === 404) {
          throw new Error(
            'User service is not available. Please try again later.'
          );
        }
      }
      throw error;
    }
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<{ user: User }>(
        `${this.baseUrl}/users/${userId}`,
        data
      );
      return response.data.user;
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(
          'User update service is not available. Please try again later.'
        );
      }
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/password-reset/request`, { email });
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(
          'Password reset service is not available. Please try again later.'
        );
      }
      throw error;
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/password-reset/verify`, {
        token,
        password,
      });
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(
          'Password reset service is not available. Please try again later.'
        );
      }
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/verify-email`, { token });
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(
          'Email verification service is not available. Please try again later.'
        );
      }
      throw error;
    }
  }

  async sendVerificationEmail(): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/send-verification-email`);
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(
          'Email verification service is not available. Please try again later.'
        );
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    await apiClient.post(`${this.baseUrl}/logout`, {});
    window.location.href = '/login';
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
  }
}

export const authService = new AuthService();
