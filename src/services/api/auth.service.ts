import { User } from '@/types/user';
import { apiService } from './api';
import type { AxiosError } from 'axios';

interface RegisterData extends Record<string, unknown> {
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
      const response = await apiService.post<AuthResponse>(
        `${this.baseUrl}/login`,
        { email, password }
      );
      const { data } = response.data;
      this.setTokens(data.token, data.refreshToken);
      return data;
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
      const { data: authData } = response.data;
      this.setTokens(authData.token, authData.refreshToken);
      return authData;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<{ user: User }>(
        `${this.baseUrl}/me`
      );
      return response.data.data.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/password-reset/request`, {
        email,
      });
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

  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await apiService.patch<{ user: User }>(
        `${this.baseUrl}/profile`,
        updates
      );
      return response.data.data.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async upgradeRole(userId: string, newRole: string): Promise<User> {
    try {
      const response = await apiService.post<{ user: User }>(
        `${this.baseUrl}/upgrade-role`,
        { userId, newRole }
      );
      return response.data.data.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkUpgradeEligibility(userId: string): Promise<{
    eligible: boolean;
    requirements: string[];
  }> {
    try {
      const response = await apiService.get(
        `${this.baseUrl}/upgrade-eligibility/${userId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token found');

      const response = await apiService.post<{
        token: string;
        refreshToken: string;
      }>(`${this.baseUrl}/refresh`, { refreshToken });
      const { data } = response.data;
      this.setTokens(data.token, data.refreshToken);
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
    return error instanceof Error && 'isAxiosError' in error;
  }
}

export const authService = new AuthService();
