import { AxiosResponse } from 'axios';
import { User, UserSettings, UserPreferences, UserProfile } from '@/types/user';
import { apiClient } from './api.client';

interface ImageUploadResponse {
  imageUrl: string;
}

interface UserUpdateData {
  id?: string;
  name?: string;
  email?: string;
  avatar?: File;
  preferences?: {
    notifications?: boolean;
    privacy?: 'public' | 'private';
    theme?: 'light' | 'dark';
  };
}

class UserService {
  private readonly baseUrl = '/users';

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiClient.get(
        `${this.baseUrl}/me`
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getProfile(userId?: string): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiClient.get<User>(
        userId ? `/users/${userId}` : '/users/profile'
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateProfile(data: Partial<UserProfile> & { id: string }): Promise<User> {
    try {
      const { id, ...updateData } = data;
      let formData: FormData | object = updateData;

      if (updateData.avatar instanceof File) {
        formData = new FormData();
        formData.append('avatar', updateData.avatar);
        Object.entries(updateData).forEach(([key, value]) => {
          if (key !== 'avatar' && value !== undefined) {
            formData.append(key, String(value));
          }
        });
      }

      const response: AxiosResponse<User> = await apiClient.put<User>(
        `/users/${id}`,
        formData,
        formData instanceof FormData
          ? {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          : undefined
      );

      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateSettings(userId: string, settings: UserSettings): Promise<User> {
    try {
      const response: AxiosResponse<User> = await apiClient.put(
        `${this.baseUrl}/${userId}/settings`,
        settings
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/users/verify/email', { token });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async verifyPhone(code: string): Promise<void> {
    try {
      await apiClient.post('/users/verify/phone', { code });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async requestPhoneVerification(): Promise<void> {
    try {
      await apiClient.post('/users/verify/phone/request');
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async uploadProfileImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response: AxiosResponse<ImageUploadResponse> = await apiClient.post(
        '/users/profile-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.imageUrl;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await apiClient.get(
        '/users/search',
        {
          params: { q: query },
        }
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updatePreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void> {
    try {
      await apiClient.put(`/users/${userId}/preferences`, preferences);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    try {
      const response: AxiosResponse<UserPreferences> = await apiClient.get(
        `/users/${userId}/preferences`
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getRecommendedUsers(): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> =
        await apiClient.get('/users/recommended');
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async blockUser(userId: string): Promise<void> {
    try {
      await apiClient.post(`/users/block/${userId}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async unblockUser(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/block/${userId}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async reportUser(userId: string, reason: string): Promise<void> {
    try {
      await apiClient.post(`/users/report/${userId}`, { reason });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete('/users/account');
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await apiClient.put('/users/password', {
        currentPassword,
        newPassword,
      });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateNotificationSettings(settings: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  }): Promise<void> {
    try {
      await apiClient.put('/users/notifications', settings);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  private handleError(error: unknown): Error {
    console.error('UserService Error:', error);
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unknown error occurred');
  }
}

export const userService = new UserService();
