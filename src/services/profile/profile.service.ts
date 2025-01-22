import { apiClient } from '../api/api.client';
import type { User, UserPreferences } from '../../types/user';

export class ProfileService {
  async fetchProfile(userId: string): Promise<User> {
    try {
      const { data } = await apiClient.get<User>(`/api/users/${userId}`);
      return data;
    } catch (error) {
      throw new Error('Failed to fetch profile');
    }
  }

  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      const { data } = await apiClient.patch<User>(`/api/users/${userId}`, updateData);
      return data;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<User> {
    try {
      const { data } = await apiClient.patch<User>(`/api/users/${userId}/preferences`, preferences);
      return data;
    } catch (error) {
      throw new Error('Failed to update preferences');
    }
  }

  async updateAvatar(userId: string, file: File): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const { data } = await apiClient.post<User>(`/api/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error) {
      throw new Error('Failed to update avatar');
    }
  }

  async deleteAvatar(userId: string): Promise<User> {
    try {
      const { data } = await apiClient.delete<User>(`/api/users/${userId}/avatar`);
      return data;
    } catch (error) {
      throw new Error('Failed to delete avatar');
    }
  }
}
