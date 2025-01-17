import { User } from '@/types/user';
import { apiClient } from './api.client';

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
  private readonly baseUrl = '/auth';

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<{ data: LoginResponse }>(`${this.baseUrl}/login`, {
      email,
      password,
    });

    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    return { token, user };
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<{ data: LoginResponse }>(
      `${this.baseUrl}/register`,
      data
    );

    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    return { token, user };
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: { user: User } }>(`${this.baseUrl}/me`);
    return response.data.data.user;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.put<{ data: { user: User } }>(
      `${this.baseUrl}/users/${userId}`,
      data
    );
    return response.data.data.user;
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post<{ data: { message: string } }>(`${this.baseUrl}/password-reset/request`, {
      email,
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post<{ data: { message: string } }>(`${this.baseUrl}/password-reset/reset`, {
      token,
      password,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post<{ data: { message: string } }>(`${this.baseUrl}/verify-email`, {
      token,
    });
  }

  async sendVerificationEmail(): Promise<void> {
    await apiClient.post<{ data: { message: string } }>(`${this.baseUrl}/verify-email/resend`);
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}

export const authService = new AuthService();
