/** @jest-environment jsdom */
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { mockUser } from '../__mocks__/user';
import { userService } from '@/services/api/user.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('@/services/api/user.service', () => ({
  userService: {
    updatePreferences: jest.fn(),
  },
}));

describe('ProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
    });
  });

  it('should render all preference sections', () => {
    render(<ProfileSettings user={mockUser} />);

    // Check for main sections
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Safety')).toBeInTheDocument();

    // Check for specific settings
    expect(screen.getByText('Maximum Distance (km)')).toBeInTheDocument();
    expect(screen.getByText('Match Notifications')).toBeInTheDocument();
    expect(screen.getByText('Show Online Status')).toBeInTheDocument();
    expect(screen.getByText('Require Verified Match')).toBeInTheDocument();
  });

  it('should initialize form with user preferences', () => {
    render(<ProfileSettings user={mockUser} />);

    // Check initial values
    expect(screen.getByLabelText('Show Online Status')).not.toBeChecked();
    expect(screen.getByLabelText('Show Location')).not.toBeChecked();
  });

  it('should handle form submission successfully', async () => {
    (userService.updatePreferences as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<ProfileSettings user={mockUser} />);

    // Toggle a preference
    const showOnlineStatusCheckbox = screen.getByLabelText(
      'Show Online Status'
    ) as HTMLInputElement;
    await act(async () => {
      fireEvent.click(showOnlineStatusCheckbox);
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(userService.updatePreferences).toHaveBeenCalledWith(mockUser.id, {
        ...mockUser.preferences,
        privacy: {
          ...mockUser.preferences.privacy,
          showOnlineStatus: true,
        },
      });
    });
  });

  it('should handle form submission error', async () => {
    (userService.updatePreferences as jest.Mock).mockRejectedValue(
      new Error('Update failed')
    );

    render(<ProfileSettings user={mockUser} />);

    // Toggle a preference
    const showOnlineStatusCheckbox = screen.getByLabelText(
      'Show Online Status'
    ) as HTMLInputElement;
    await act(async () => {
      fireEvent.click(showOnlineStatusCheckbox);
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });
  });
});
