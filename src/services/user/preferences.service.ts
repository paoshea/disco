import { apiClient } from '@/services/api/api.client';

export const updatePreferences = async (userId: string, preferences: any) => {
  const response = await apiClient.patch(
    `/users/${userId}/preferences`,
    preferences
  );
  return response.data;
};

export const mockUpdatePreferences = jest.fn();
