/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSettings } from '../../components/profile/ProfileSettings';
import { updateUserPreferences } from '../../services/api/user.service';

jest.mock('../../services/api/user.service');

const mockDate = new Date('2025-01-21T22:12:49-06:00');

const mockUser = {
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

const mockUpdatePreferences = updateUserPreferences as jest.MockedFunction<typeof updateUserPreferences>;

describe('ProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile settings with user preferences', () => {
    render(<ProfileSettings user={mockUser} />);

    // Check privacy settings
    expect(screen.getByRole('switch', { name: /show online status/i })).toBeChecked();
    expect(screen.getByRole('switch', { name: /show last seen/i })).toBeChecked();
    expect(screen.getByRole('switch', { name: /show location/i })).toBeChecked();
    expect(screen.getByRole('switch', { name: /show age/i })).toBeChecked();

    // Check notification settings
    expect(screen.getByRole('switch', { name: /match notifications/i })).toBeChecked();
    expect(screen.getByRole('switch', { name: /message notifications/i })).toBeChecked();
    expect(screen.getByRole('switch', { name: /event notifications/i })).toBeChecked();
    expect(screen.getByRole('switch', { name: /safety notifications/i })).toBeChecked();

    // Check safety settings
    expect(screen.getByRole('switch', { name: /require verified match/i })).toBeChecked();
    expect(screen.getByRole('switch', { name: /meetup check-ins/i })).toBeChecked();
    expect(screen.getByRole('switch', { name: /emergency contact alerts/i })).toBeChecked();
  });

  it('should handle privacy setting changes', async () => {
    render(<ProfileSettings user={mockUser} />);

    const showOnlineStatusToggle = screen.getByRole('switch', { name: /show online status/i });
    const showLocationToggle = screen.getByRole('switch', { name: /show location/i });

    mockUpdatePreferences.mockResolvedValueOnce();

    fireEvent.click(showOnlineStatusToggle);
    fireEvent.click(showLocationToggle);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          preferences: expect.objectContaining({
            privacy: expect.objectContaining({
              showOnlineStatus: false,
              showLocation: false,
            }),
          }),
        })
      );
    });
  });

  it('should handle notification setting changes', async () => {
    render(<ProfileSettings user={mockUser} />);

    const matchNotificationsToggle = screen.getByRole('switch', { name: /match notifications/i });
    const messageNotificationsToggle = screen.getByRole('switch', { name: /message notifications/i });

    mockUpdatePreferences.mockResolvedValueOnce();

    fireEvent.click(matchNotificationsToggle);
    fireEvent.click(messageNotificationsToggle);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          preferences: expect.objectContaining({
            notifications: expect.objectContaining({
              matches: false,
              messages: false,
            }),
          }),
        })
      );
    });
  });

  it('should handle safety setting changes', async () => {
    render(<ProfileSettings user={mockUser} />);

    const verifiedMatchToggle = screen.getByRole('switch', { name: /require verified match/i });
    const meetupCheckinsToggle = screen.getByRole('switch', { name: /meetup check-ins/i });

    mockUpdatePreferences.mockResolvedValueOnce();

    fireEvent.click(verifiedMatchToggle);
    fireEvent.click(meetupCheckinsToggle);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          preferences: expect.objectContaining({
            safety: expect.objectContaining({
              requireVerifiedMatch: false,
              meetupCheckins: false,
            }),
          }),
        })
      );
    });
  });

  it('should handle max distance changes', async () => {
    render(<ProfileSettings user={mockUser} />);

    const maxDistanceInput = screen.getByLabelText(/maximum distance/i);

    mockUpdatePreferences.mockResolvedValueOnce();

    await userEvent.clear(maxDistanceInput);
    await userEvent.type(maxDistanceInput, '25');
    fireEvent.blur(maxDistanceInput);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith(
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

    mockUpdatePreferences.mockResolvedValueOnce();

    await userEvent.clear(minAgeInput);
    await userEvent.type(minAgeInput, '21');
    await userEvent.clear(maxAgeInput);
    await userEvent.type(maxAgeInput, '35');
    fireEvent.blur(maxAgeInput);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith(
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

    const showOnlineStatusToggle = screen.getByRole('switch', { name: /show online status/i });

    mockUpdatePreferences.mockRejectedValueOnce(new Error('Update failed'));

    fireEvent.click(showOnlineStatusToggle);

    await waitFor(() => {
      expect(screen.getByText(/failed to update preferences/i)).toBeInTheDocument();
    });
  });

  it('should render user preferences correctly', () => {
    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByRole('switch', { name: /show online status/i });
    const emailNotificationsSwitch = screen.getByRole('switch', { name: /email notifications/i });
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

    mockUpdatePreferences.mockResolvedValueOnce(updatedPreferences);

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByRole('switch', { name: /show online status/i });
    fireEvent.click(onlineStatusSwitch);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        updatedPreferences
      );
    });
  });

  it('should show error message when update fails', async () => {
    mockUpdatePreferences.mockRejectedValueOnce(new Error('Update failed'));

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByRole('switch', { name: /show online status/i });
    fireEvent.click(onlineStatusSwitch);

    await waitFor(() => {
      expect(screen.getByText(/failed to update preferences/i)).toBeInTheDocument();
    });
  });
});
