import { User } from '@/types/user';
import { apiClient, type AuthResponse } from './api.client';
import axios, { AxiosError } from 'axios';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

class AuthService {
  private readonly baseUrl = '/api/auth';

  private handleError(error: unknown): never {
    if (this.isAxiosError(error)) {
      if (error.code === 'ERR_NETWORK') {
        throw new Error(
          'Unable to connect to the server. Please check your internet connection.'
        );
      }
      if (error.response?.status === 401) {
        // Clear tokens on unauthorized
        this.clearTokens();
        throw new Error('Invalid email or password');
      }
      if (error.response?.status === 404) {
        throw new Error(
          'Login service is not available. Please try again later.'
        );
      }
      const errorData = error.response?.data as ErrorResponse | undefined;
      throw new Error(
        errorData?.message || errorData?.error || 'An unexpected error occurred'
      );
    }
    throw error;
  }

  private setTokens(token: string, refreshToken?: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
  }

  private clearTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.baseUrl}/login`,
        {
          email,
          password,
        }
      );

      const { token, refreshToken } = response.data;
      this.setTokens(token, refreshToken);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        `${this.baseUrl}/signup`,
        data
      );
      const { token, refreshToken } = response.data;
      this.setTokens(token, refreshToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get<{ user: User }>(
        `${this.baseUrl}/me`
      );
      return response.data.user;
    } catch (error) {
      if (this.isAxiosError(error) && error.response?.status === 401) {
        this.clearTokens();
      }
      throw this.handleError(error);
    }
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.patch<{ user: User }>(
        `${this.baseUrl}/profile`,
        updates
      );
      return response.data.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/password-reset/request`, { email });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/password-reset/reset`, {
        token,
        password,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await apiClient.post<{
        token: string;
        refreshToken: string;
      }>(
        `${this.baseUrl}/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      this.setTokens(response.data.token, response.data.refreshToken);
      return response.data;
    } catch (error) {
      this.clearTokens();
      throw this.handleError(error);
    }
  }

  logout(): void {
    this.clearTokens();
    window.location.href = '/login';
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return axios.isAxiosError(error);
  }
}

export const authService = new AuthService();
