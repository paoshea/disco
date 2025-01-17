import { AxiosResponse } from 'axios';
import { User, UserSettings, UserPreferences } from '@/types/user';
import { api } from './api';

interface ImageUploadResponse {
  imageUrl: string;
}

interface UserUpdateData {
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
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.get('/users/me');
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getProfile(userId: string): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.get(`/users/${userId}`);
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await api.get<{ user: User }>('/users/profile');
      return response.data.user;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      if (!userData.id) {
        throw new Error('User ID is required for update');
      }
      const response: AxiosResponse<User> = await api.put(`/users/${userData.id}`, userData);
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateProfile(data: UserUpdateData): Promise<User> {
    try {
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'avatar' && value instanceof File) {
          formData.append('avatar', value);
        } else if (key === 'preferences' && typeof value === 'object') {
          formData.append('preferences', JSON.stringify(value));
        } else if (value !== undefined) {
          formData.append(key, String(value));
        }
      });

      const response = await api.put<{ user: User }>('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.user;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateSettings(userId: string, settings: UserSettings): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.put(`/users/${userId}/settings`, settings);
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post('/users/verify/email', { token });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async verifyPhone(code: string): Promise<void> {
    try {
      await api.post('/users/verify/phone', { code });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async requestPhoneVerification(): Promise<void> {
    try {
      await api.post('/users/verify/phone/request');
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async uploadProfileImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response: AxiosResponse<ImageUploadResponse> = await api.post(
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
      const response: AxiosResponse<User[]> = await api.get('/users/search', {
        params: { q: query },
      });
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updatePreferences(userId: string, preferences: UserPreferences): Promise<void> {
    try {
      await api.put(`/users/${userId}/preferences`, preferences);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    try {
      const response: AxiosResponse<UserPreferences> = await api.get(`/users/${userId}/preferences`);
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getRecommendedUsers(): Promise<User[]> {
    try {
      const response: AxiosResponse<User[]> = await api.get('/users/recommended');
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async blockUser(userId: string): Promise<void> {
    try {
      await api.post(`/users/block/${userId}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async unblockUser(userId: string): Promise<void> {
    try {
      await api.delete(`/users/block/${userId}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async reportUser(userId: string, reason: string): Promise<void> {
    try {
      await api.post(`/users/report/${userId}`, { reason });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await api.delete('/users/account');
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/users/password', {
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
      await api.put('/users/notifications', settings);
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

export const userService = new UserService();
