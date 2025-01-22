/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { mockUser } from '../mocks/user';
import { mockPreferencesService } from '../mocks/preferencesService';

// Mock the preferences service
jest.mock('@/services/preferences/preferences.service', () => ({
  preferencesService: {
    updatePreferences: jest.fn(),
  },
}));

const mockDate = new Date('2025-01-21T22:12:49-06:00');

describe('ProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all preferences sections', () => {
    render(<ProfileSettings user={mockUser} />);

    // Check for section headings
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Safety')).toBeInTheDocument();

    // Check for specific preferences
    expect(screen.getByLabelText('Show Online Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Show Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Match Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Message Notifications')).toBeInTheDocument();
  });

  it('should render profile settings with user preferences', () => {
    render(<ProfileSettings user={mockUser} />);

    // Check headings
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Safety')).toBeInTheDocument();

    // Check notification checkboxes
    const matchNotifications = screen.getByLabelText('Match Notifications');
    const messageNotifications = screen.getByLabelText('Message Notifications');
    const emailNotifications = screen.getByLabelText('Email Notifications');
    
    expect(matchNotifications).toBeInTheDocument();
    expect(messageNotifications).toBeInTheDocument();
    expect(emailNotifications).toBeInTheDocument();
    
    expect(matchNotifications).toBeChecked();
    expect(messageNotifications).toBeChecked();
    expect(emailNotifications).toBeChecked();

    // Check privacy checkboxes
    const showOnlineStatus = screen.getByLabelText('Show Online Status');
    const showLocation = screen.getByLabelText('Show Location');
    
    expect(showOnlineStatus).toBeInTheDocument();
    expect(showLocation).toBeInTheDocument();
    
    expect(showOnlineStatus).toBeChecked();
    expect(showLocation).toBeChecked();

    // Check safety checkboxes
    const requireVerifiedMatch = screen.getByLabelText('Require Verified Match');
    const blockUnverifiedUsers = screen.getByLabelText('Block Unverified Users');
    
    expect(requireVerifiedMatch).toBeInTheDocument();
    expect(blockUnverifiedUsers).toBeInTheDocument();
    
    expect(requireVerifiedMatch).toBeChecked();
    expect(blockUnverifiedUsers).not.toBeChecked();
  });

  it('should update preferences when toggling checkboxes', async () => {
    mockPreferencesService.updatePreferences.mockResolvedValueOnce({
      success: true,
      data: {
        id: '1',
        userId: mockUser.id,
        privacy: {
          showLocation: false,
          showOnlineStatus: false,
        },
      },
    });

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusCheckbox = screen.getByLabelText('Show Online Status') as HTMLInputElement;
    const locationCheckbox = screen.getByLabelText('Show Location') as HTMLInputElement;

    // Toggle checkboxes
    fireEvent.click(onlineStatusCheckbox);
    fireEvent.click(locationCheckbox);

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPreferencesService.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          privacy: expect.objectContaining({
            showLocation: false,
            showOnlineStatus: false,
          }),
        })
      );
    });

    // Success message should be shown
    await waitFor(() => {
      expect(screen.getByText(/preferences updated successfully/i)).toBeInTheDocument();
    });
  });

  it('should show error message when update fails', async () => {
    mockPreferencesService.updatePreferences.mockRejectedValueOnce(new Error('Failed to update'));

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusCheckbox = screen.getByLabelText('Show Online Status') as HTMLInputElement;
    fireEvent.click(onlineStatusCheckbox);

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    // Error message should be shown
    await waitFor(() => {
      expect(screen.getByText(/failed to update preferences/i)).toBeInTheDocument();
    });
  });

  it('should handle max distance changes', async () => {
    render(<ProfileSettings user={mockUser} />);

    const maxDistanceInput = screen.getByLabelText(/maximum distance/i);

    mockPreferencesService.updatePreferences.mockResolvedValueOnce();

    await userEvent.clear(maxDistanceInput);
    await userEvent.type(maxDistanceInput, '25');
    fireEvent.blur(maxDistanceInput);

    await waitFor(() => {
      expect(mockPreferencesService.updatePreferences).toHaveBeenCalledWith(
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

    mockPreferencesService.updatePreferences.mockResolvedValueOnce();

    await userEvent.clear(minAgeInput);
    await userEvent.type(minAgeInput, '21');
    await userEvent.clear(maxAgeInput);
    await userEvent.type(maxAgeInput, '35');
    fireEvent.blur(maxAgeInput);

    await waitFor(() => {
      expect(mockPreferencesService.updatePreferences).toHaveBeenCalledWith(
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

    const showOnlineStatusToggle = screen.getByRole('checkbox', {
      name: /show online status/i,
    });

    mockPreferencesService.updatePreferences.mockRejectedValueOnce(new Error('Update failed'));

    fireEvent.click(showOnlineStatusToggle);

    await waitFor(() => {
      expect(
        screen.getByText(/failed to update preferences/i)
      ).toBeInTheDocument();
    });
  });

  it('should render user preferences correctly', () => {
    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByRole('checkbox', {
      name: /show online status/i,
    });
    const emailNotificationsSwitch = screen.getByRole('checkbox', {
      name: /email notifications/i,
    });
    const themeSelect = screen.getByLabelText(/theme/i);

    expect(onlineStatusSwitch).toBeChecked();
    expect(emailNotificationsSwitch).toBeChecked();
    expect(themeSelect).toHaveValue('light');
  });

  it('should update preferences when toggling checkboxes', async () => {
    mockPreferencesService.updatePreferences.mockResolvedValueOnce({
      success: true,
      data: {
        id: '1',
        userId: mockUser.id,
        privacy: {
          showLocation: false,
          showOnlineStatus: false,
        },
      },
    });

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByRole('checkbox', {
      name: /show online status/i,
    }) as HTMLInputElement;
    fireEvent.click(onlineStatusSwitch);

    // Submit form
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPreferencesService.updatePreferences).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          privacy: expect.objectContaining({
            showLocation: false,
            showOnlineStatus: false,
          }),
        })
      );
    });

    // Success message should be shown
    await waitFor(() => {
      expect(screen.getByText('Preferences updated successfully')).toBeInTheDocument();
    });
  });

  it('should show error message when update fails', async () => {
    mockPreferencesService.updatePreferences.mockRejectedValueOnce(new Error('Update failed'));

    render(<ProfileSettings user={mockUser} />);

    const onlineStatusSwitch = screen.getByRole('checkbox', {
      name: /show online status/i,
    }) as HTMLInputElement;
    fireEvent.click(onlineStatusSwitch);

    // Submit form
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Error message should be shown
    await waitFor(() => {
      expect(
        screen.getByText(/failed to update preferences/i)
      ).toBeInTheDocument();
    });
  });
});
