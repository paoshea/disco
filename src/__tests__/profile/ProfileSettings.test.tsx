/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import * as preferencesService from '@/services/user/preferences.service';

jest.mock('@/services/user/preferences.service');

const mockDate = new Date('2025-01-21T22:12:49-06:00');

const mockUser = {
  id: '1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  name: 'Test User',
  bio: 'Test bio',
  interests: ['Technology', 'Gaming'],
  phoneNumber: '+1234567890',
  avatar: 'https://example.com/avatar.jpg',
  role: 'user',
  emailVerified: true,
  lastActive: mockDate,
  verificationStatus: 'verified',
  streakCount: 0,
  createdAt: mockDate,
  updatedAt: mockDate,
  preferences: {
    maxDistance: 50,
    ageRange: { min: 18, max: 99 },
    interests: ['Technology', 'Gaming'],
    gender: ['any'],
    lookingFor: ['friendship'],
    relationshipType: ['casual'],
    notifications: {
      email: true,
      push: true,
      messages: true,
      matches: true,
      events: true,
      safety: true,
    },
    privacy: {
      showAge: true,
      showLocation: true,
      showOnlineStatus: true,
      showLastSeen: true,
    },
    safety: {
      requireVerifiedMatch: true,
      blockUnverifiedUsers: false,
      emergencyContactEnabled: true,
      emergencyContactAlerts: true,
      meetupCheckins: true,
    },
  },
};

describe('ProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile settings with user preferences', () => {
    render(<ProfileSettings user={mockUser} />);

    // Check headings
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Safety')).toBeInTheDocument();

    // Check notification toggles
    expect(screen.getByLabelText('Match Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Message Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Notifications')).toBeInTheDocument();

    // Check privacy toggles
    expect(screen.getByLabelText('Show Online Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Show Location')).toBeInTheDocument();

    // Check safety toggles
    expect(screen.getByLabelText('Require Verified Match')).toBeInTheDocument();
    expect(screen.getByLabelText('Block Unverified Users')).toBeInTheDocument();
  });

  it('should update preferences when toggling switches', async () => {
    const updatedPreferences = {
      ...mockUser.preferences,
      privacy: {
        ...mockUser.preferences.privacy,
        showOnlineStatus: false,
      },
    };

    jest.spyOn(preferencesService, 'updatePreferences').mockResolvedValueOnce(updatedPreferences);

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByLabelText('Show Online Status');
    const locationSwitch = screen.getByLabelText('Show Location');

    fireEvent.click(onlineStatusSwitch);
    fireEvent.click(locationSwitch);

    await waitFor(() => {
      expect(preferencesService.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          privacy: expect.objectContaining({
            showOnlineStatus: false,
            showLocation: false,
          }),
        })
      );
    });
  });

  it('should show error message when update fails', async () => {
    jest.spyOn(preferencesService, 'updatePreferences').mockRejectedValueOnce(new Error('Update failed'));

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByLabelText('Show Online Status');
    fireEvent.click(onlineStatusSwitch);

    await waitFor(() => {
      expect(screen.getByText('Failed to update settings')).toBeInTheDocument();
    });
  });

  it('should show success message when update succeeds', async () => {
    jest.spyOn(preferencesService, 'updatePreferences').mockResolvedValueOnce(mockUser.preferences);

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByLabelText('Show Online Status');
    fireEvent.click(onlineStatusSwitch);

    await waitFor(() => {
      expect(screen.getByText('Settings updated successfully')).toBeInTheDocument();
    });
  });

  it('should handle max distance changes', async () => {
    render(<ProfileSettings user={mockUser} />);

    const maxDistanceInput = screen.getByLabelText(/maximum distance/i);

    jest.spyOn(preferencesService, 'updatePreferences').mockResolvedValueOnce();

    await userEvent.clear(maxDistanceInput);
    await userEvent.type(maxDistanceInput, '25');
    fireEvent.blur(maxDistanceInput);

    await waitFor(() => {
      expect(preferencesService.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          preferences: expect.objectContaining({
            maxDistance: 25,
          }),
        })
      );
    });
  });

  it('should handle age range changes', async () => {
    render(<ProfileSettings user={mockUser} />);

    const minAgeInput = screen.getByLabelText(/minimum age/i);
    const maxAgeInput = screen.getByLabelText(/maximum age/i);

    jest.spyOn(preferencesService, 'updatePreferences').mockResolvedValueOnce();

    await userEvent.clear(minAgeInput);
    await userEvent.type(minAgeInput, '21');
    await userEvent.clear(maxAgeInput);
    await userEvent.type(maxAgeInput, '35');
    fireEvent.blur(maxAgeInput);

    await waitFor(() => {
      expect(preferencesService.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          preferences: expect.objectContaining({
            ageRange: { min: 21, max: 35 },
          }),
        })
      );
    });
  });

  it('should handle preference update errors', async () => {
    render(<ProfileSettings user={mockUser} />);

    const showOnlineStatusToggle = screen.getByRole('switch', {
      name: /show online status/i,
    });

    jest.spyOn(preferencesService, 'updatePreferences').mockRejectedValueOnce(new Error('Update failed'));

    fireEvent.click(showOnlineStatusToggle);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to update preferences/i)
      ).toBeInTheDocument();
    });
  });

  it('should render user preferences correctly', () => {
    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByRole('switch', {
      name: /show online status/i,
    });
    const emailNotificationsSwitch = screen.getByRole('switch', {
      name: /email notifications/i,
    });
    const themeSelect = screen.getByLabelText(/theme/i);

    expect(onlineStatusSwitch).toBeChecked();
    expect(emailNotificationsSwitch).toBeChecked();
    expect(themeSelect).toHaveValue('light');
  });

  it('should update preferences when toggling switches', async () => {
    const updatedPreferences = {
      ...mockUser.preferences,
      privacy: {
        ...mockUser.preferences.privacy,
        showOnlineStatus: false,
      },
    };

    jest.spyOn(preferencesService, 'updatePreferences').mockResolvedValueOnce(updatedPreferences);

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByRole('switch', {
      name: /show online status/i,
    });
    fireEvent.click(onlineStatusSwitch);

    await waitFor(() => {
      expect(preferencesService.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        updatedPreferences
      );
    });
  });

  it('should show error message when update fails', async () => {
    jest.spyOn(preferencesService, 'updatePreferences').mockRejectedValueOnce(new Error('Update failed'));

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByRole('switch', {
      name: /show online status/i,
    });
    fireEvent.click(onlineStatusSwitch);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to update preferences/i)
      ).toBeInTheDocument();
    });
  });
});
