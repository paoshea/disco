import {
  UserPreferences,
  PreferencesUpdateResponse,
  PreferencesServiceInterface,
} from '@/types/preferences';
import { apiClient } from '@/lib/api/client';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export class PreferencesService implements PreferencesServiceInterface {
  private readonly baseUrl = '/users';

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const response = await apiClient.get<ApiResponse<UserPreferences>>(
        `${this.baseUrl}/${userId}/preferences`
      );
      return response.data.data;
    } catch (error) {
      console.error('PreferencesService Error:', error);
      throw error;
    }
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<PreferencesUpdateResponse<UserPreferences>> {
    try {
      const response = await apiClient.put<ApiResponse<UserPreferences>>(
        `${this.baseUrl}/${userId}/preferences`,
        preferences
      );
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('PreferencesService Error:', error);
      return {
        success: false,
        error: 'Failed to update preferences',
      };
    }
  }

  async resetPreferences(
    userId: string
  ): Promise<PreferencesUpdateResponse<UserPreferences>> {
    try {
      const response = await apiClient.delete<ApiResponse<UserPreferences>>(
        `${this.baseUrl}/${userId}/preferences`
      );
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('PreferencesService Error:', error);
      return {
        success: false,
        error: 'Failed to reset preferences',
      };
    }
  }

  async getMatchPreferences(): Promise<UserPreferences> {
    try {
      const response = await apiClient.get<ApiResponse<UserPreferences>>(
        `${this.baseUrl}/match-preferences`
      );
      return response.data.data;
    } catch (error) {
      console.error('PreferencesService Error:', error);
      throw error;
    }
  }

  async updateMatchPreferences(
    preferences: Partial<UserPreferences>
  ): Promise<PreferencesUpdateResponse<UserPreferences>> {
    try {
      const response = await apiClient.put<ApiResponse<UserPreferences>>(
        `${this.baseUrl}/match-preferences`,
        preferences
      );
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('PreferencesService Error:', error);
      return {
        success: false,
        error: 'Failed to update match preferences',
      };
    }
  }
}

export const preferencesService = new PreferencesService();
