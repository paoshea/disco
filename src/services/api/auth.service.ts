import { User } from '@/types/user';
import { apiClient } from './api.client';
import type { AxiosError } from 'axios';

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

class AuthService {
  private readonly baseUrl = '/api/auth';

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(`${this.baseUrl}/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Login service is not available. Please try again later.');
      }
      throw error;
    }
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(`${this.baseUrl}/signup`, data);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return { token, user };
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Registration service is not available. Please try again later.');
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<{ user: User }>(`${this.baseUrl}/me`);
      return response.data.user;
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('User service is not available. Please try again later.');
      }
      throw error;
    }
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put<{ user: User }>(`${this.baseUrl}/users/${userId}`, data);
      return response.data.user;
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('User update service is not available. Please try again later.');
      }
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/password-reset/request`, {
      email,
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/password-reset/reset`, {
      token,
      password,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/verify-email`, {
      token,
    });
  }

  async sendVerificationEmail(): Promise<void> {
    await apiClient.post(`${this.baseUrl}/verify-email/resend`);
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
  }
}

export const authService = new AuthService();
