import { User } from '@/types/user';
import { apiService } from './api';
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

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

class AuthService {
  private readonly baseUrl = '/api/auth';

  private handleError(error: unknown): never {
    if (this.isAxiosError(error)) {
      if (error.response?.status === 401) {
        this.clearTokens();
        throw new Error('Unauthorized access. Please login again.');
      }
      const errorData = error.response?.data as ErrorResponse | undefined;
      throw new Error(
        errorData?.message || errorData?.error || 'An unexpected error occurred'
      );
    }
    throw error;
  }

  private setTokens(token: string, refreshToken?: string): void {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(`${this.baseUrl}/login`, {
        email,
        password,
      });
      const { token, refreshToken } = response.data;
      this.setTokens(token, refreshToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(
        `${this.baseUrl}/register`,
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
      const response = await apiService.get<{ user: User }>(
        `${this.baseUrl}/me`
      );
      return response.data.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/password-reset/request`, { email });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/password-reset/reset`, {
        token,
        password,
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token found');

      const response = await apiService.post<{ token: string; refreshToken: string }>(
        `${this.baseUrl}/refresh`,
        { refreshToken }
      );

      const { token } = response.data;
      this.setTokens(token, response.data.refreshToken);
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
