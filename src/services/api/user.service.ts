import { User, UserSettings } from '@/types/user';
import { api } from './api';

class UserService {
  async getProfile(userId: string): Promise<User> {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${userData.id}`, userData);
    return response.data;
  }

  async updateSettings(userId: string, settings: UserSettings): Promise<User> {
    const response = await api.put(`/users/${userId}/settings`, settings);
    return response.data;
  }

  async verifyEmail(token: string): Promise<void> {
    await api.post('/users/verify/email', { token });
  }

  async verifyPhone(code: string): Promise<void> {
    await api.post('/users/verify/phone', { code });
  }

  async requestPhoneVerification(): Promise<void> {
    await api.post('/users/verify/phone/request');
  }

  async uploadProfileImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/users/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.imageUrl;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await api.get('/users/search', {
      params: { q: query },
    });
    return response.data;
  }

  async getRecommendedUsers(): Promise<User[]> {
    const response = await api.get('/users/recommended');
    return response.data;
  }

  async blockUser(userId: string): Promise<void> {
    await api.post(`/users/block/${userId}`);
  }

  async unblockUser(userId: string): Promise<void> {
    await api.delete(`/users/block/${userId}`);
  }

  async reportUser(userId: string, reason: string): Promise<void> {
    await api.post(`/users/report/${userId}`, { reason });
  }

  async deleteAccount(): Promise<void> {
    await api.delete('/users/account');
  }
}

export const userService = new UserService();
