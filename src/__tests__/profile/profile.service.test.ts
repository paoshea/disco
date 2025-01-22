import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ProfileService } from '../../services/profile/profile.service';
import { apiClient } from '../../services/api/api.client';
import type { User, UserPreferences } from '../../types/user';

jest.mock('../../services/api/api.client');

const mockDate = new Date('2025-01-21T22:12:49-06:00');

const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  name: 'Test User',
  bio: 'Test bio',
  interests: ['Technology', 'Gaming'],
  phoneNumber: '+1234567890',
  avatar: 'https://example.com/avatar.jpg',
  role: 'user',
  emailVerified: true,
  lastActive: mockDate,
  createdAt: mockDate,
  updatedAt: mockDate,
  streakCount: 0,
  verificationStatus: 'verified' as const,
  preferences: {
    maxDistance: 50,
    ageRange: { min: 18, max: 99 },
    interests: ['Technology', 'Gaming'],
    gender: ['any'],
    lookingFor: ['friendship'],
    relationshipType: ['casual'],
    notifications: {
      matches: true,
      messages: true,
      events: true,
      safety: true,
    },
    privacy: {
      showOnlineStatus: true,
      showLastSeen: true,
      showLocation: true,
      showAge: true,
    },
    safety: {
      requireVerifiedMatch: true,
      meetupCheckins: true,
      emergencyContactAlerts: true,
    },
  },
};

describe('ProfileService', () => {
  let profileService: ProfileService;
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    profileService = new ProfileService();
  });

  describe('fetchProfile', () => {
    it('should fetch user profile successfully', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: mockUser });

      const result = await profileService.fetchProfile('123');

      expect(result).toEqual(mockUser);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/users/123');
    });

    it('should handle fetch profile error', async () => {
      const error = new Error('Failed to fetch profile');
      mockApiClient.get.mockRejectedValueOnce(error);

      await expect(profileService.fetchProfile('123')).rejects.toThrow('Failed to fetch profile');
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/users/123');
    });
  });

  describe('updateProfile', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      bio: 'Updated bio',
    };

    it('should update user profile successfully', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      mockApiClient.patch.mockResolvedValueOnce({ data: updatedUser });

      const result = await profileService.updateProfile('123', updateData);

      expect(result).toEqual(updatedUser);
      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/users/123', updateData);
    });

    it('should handle update profile error', async () => {
      const error = new Error('Failed to update profile');
      mockApiClient.patch.mockRejectedValueOnce(error);

      await expect(profileService.updateProfile('123', updateData)).rejects.toThrow('Failed to update profile');
      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/users/123', updateData);
    });
  });

  describe('updatePreferences', () => {
    const preferences: Partial<UserPreferences> = {
      maxDistance: 100,
      ageRange: { min: 21, max: 35 },
      interests: ['Sports', 'Music'],
    };

    it('should update user preferences successfully', async () => {
      const updatedUser = {
        ...mockUser,
        preferences: { ...mockUser.preferences, ...preferences },
      };
      mockApiClient.patch.mockResolvedValueOnce({ data: updatedUser });

      const result = await profileService.updatePreferences('123', preferences);

      expect(result).toEqual(updatedUser);
      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/users/123/preferences', preferences);
    });

    it('should handle update preferences error', async () => {
      const error = new Error('Failed to update preferences');
      mockApiClient.patch.mockRejectedValueOnce(error);

      await expect(profileService.updatePreferences('123', preferences)).rejects.toThrow('Failed to update preferences');
      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/users/123/preferences', preferences);
    });
  });

  describe('updateAvatar', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    it('should update user avatar successfully', async () => {
      const updatedUser = {
        ...mockUser,
        avatar: 'https://example.com/new-avatar.jpg',
      };
      mockApiClient.post.mockResolvedValueOnce({ data: updatedUser });

      const result = await profileService.updateAvatar('123', mockFile);

      expect(result).toEqual(updatedUser);
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/users/123/avatar', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });

    it('should handle update avatar error', async () => {
      const error = new Error('Failed to update avatar');
      mockApiClient.post.mockRejectedValueOnce(error);

      await expect(profileService.updateAvatar('123', mockFile)).rejects.toThrow('Failed to update avatar');
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/users/123/avatar', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });
  });

  describe('deleteAvatar', () => {
    it('should delete user avatar successfully', async () => {
      const updatedUser = {
        ...mockUser,
        avatar: null,
      };
      mockApiClient.delete.mockResolvedValueOnce({ data: updatedUser });

      const result = await profileService.deleteAvatar('123');

      expect(result).toEqual(updatedUser);
      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/users/123/avatar');
    });

    it('should handle delete avatar error', async () => {
      const error = new Error('Failed to delete avatar');
      mockApiClient.delete.mockRejectedValueOnce(error);

      await expect(profileService.deleteAvatar('123')).rejects.toThrow('Failed to delete avatar');
      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/users/123/avatar');
    });
  });
});
