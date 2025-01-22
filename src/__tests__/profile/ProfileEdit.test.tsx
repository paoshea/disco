/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEdit } from '../../components/profile/ProfileEdit';
import { useToast } from '../../hooks/use-toast';
import type { User } from '../../types/user';

jest.mock('../../hooks/use-toast');

const mockDate = new Date('2025-01-21T22:12:49-06:00');

const mockUser: User = {
  id: '123',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phoneNumber: '+1234567890',
  bio: 'Test bio',
  interests: ['Technology', 'Gaming'],
  avatar: 'https://example.com/avatar.jpg',
  name: 'Test User',
  emailVerified: true,
  verificationStatus: 'verified',
  role: 'user',
  streakCount: 0,
  createdAt: new Date('2025-01-22T04:12:49Z'),
  updatedAt: new Date('2025-01-22T04:12:49Z'),
  lastActive: new Date('2025-01-22T04:12:49Z'),
  preferences: {
    interests: ['Technology', 'Gaming'],
    gender: ['any'],
    lookingFor: ['friendship'],
    relationshipType: ['casual'],
    ageRange: { min: 18, max: 99 },
    maxDistance: 50,
    notifications: {
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
      meetupCheckins: true,
      emergencyContactAlerts: true,
    },
  },
};

const mockOnUpdate = jest.fn();
const mockToast = { success: jest.fn(), error: jest.fn() };

describe('ProfileEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  it('should render user profile data', () => {
    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdate} />);

    expect(screen.getByLabelText(/first name/i)).toHaveValue('Test');
    expect(screen.getByLabelText(/last name/i)).toHaveValue('User');
    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/phone number/i)).toHaveValue('+1234567890');
    expect(screen.getByLabelText(/bio/i)).toHaveValue('Test bio');

    // Check selected interests
    expect(screen.getByRole('button', { name: 'Technology' })).toHaveClass(
      'bg-primary-100'
    );
    expect(screen.getByRole('button', { name: 'Gaming' })).toHaveClass(
      'bg-primary-100'
    );
  });

  it('should handle interest selection', async () => {
    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdate} />);

    // Click an unselected interest
    const sportsButton = screen.getByRole('button', { name: 'Sports' });
    await userEvent.click(sportsButton);

    // Verify the onUpdate call includes the new interest
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        interests: ['Technology', 'Gaming', 'Sports'],
      });
    });

    // Click a selected interest to unselect
    const techButton = screen.getByRole('button', { name: 'Technology' });
    await userEvent.click(techButton);

    // Verify the onUpdate call removes the interest
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        interests: ['Gaming', 'Sports'],
      });
    });
  });

  it('should validate required fields', async () => {
    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdate} />);

    // Clear required fields
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    await userEvent.clear(firstNameInput);
    await userEvent.clear(lastNameInput);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      const errorDiv = screen.getByRole('alert');
      expect(errorDiv).toHaveTextContent(
        'First name is required, Last name is required'
      );
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  it('should handle form submission with valid data', async () => {
    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdate} />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const bioInput = screen.getByLabelText(/bio/i);

    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Updated');
    await userEvent.clear(lastNameInput);
    await userEvent.type(lastNameInput, 'Name');
    await userEvent.clear(bioInput);
    await userEvent.type(bioInput, 'Updated bio');

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio',
      });
    });
  });

  it('should handle submission errors', async () => {
    const error = new Error('Update failed');
    mockOnUpdate.mockRejectedValueOnce(error);

    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdate} />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Update failed');
    });
  });

  it('should disable form submission while submitting', async () => {
    const mockOnUpdateWithDelay = jest
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdateWithDelay} />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveAttribute('disabled');
      expect(submitButton).toHaveTextContent('Saving...');
      expect(submitButton.closest('button')).toHaveClass(
        'opacity-50',
        'cursor-not-allowed'
      );
    });

    await waitFor(() => {
      expect(submitButton).not.toHaveAttribute('disabled');
      expect(submitButton).toHaveTextContent('Save Changes');
      expect(submitButton.closest('button')).not.toHaveClass(
        'opacity-50',
        'cursor-not-allowed'
      );
    });
  });

  it('should render profile settings with user preferences', () => {
    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdate} />);

    // Check form fields
    expect(screen.getByLabelText(/first name/i)).toHaveValue(
      mockUser.firstName
    );
    expect(screen.getByLabelText(/last name/i)).toHaveValue(mockUser.lastName);
    expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email);
    expect(screen.getByLabelText(/phone number/i)).toHaveValue(
      mockUser.phoneNumber
    );
    expect(screen.getByLabelText(/bio/i)).toHaveValue(mockUser.bio);

    // Check interests
    (mockUser.interests || []).forEach(interest => {
      const button = screen.getByRole('button', { name: interest });
      expect(button).toHaveClass('bg-primary-100');
    });
  });

  it('should handle form submission with valid data', async () => {
    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdate} />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const bioInput = screen.getByLabelText(/bio/i);
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Updated');
    await userEvent.clear(lastNameInput);
    await userEvent.type(lastNameInput, 'Name');
    await userEvent.clear(bioInput);
    await userEvent.type(bioInput, 'Updated bio');

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio',
      });
    });
  });

  it('should show validation errors for invalid data', async () => {
    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdate} />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    await userEvent.clear(firstNameInput);
    fireEvent.click(submitButton);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'First name is required'
    );
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('should handle submission errors', async () => {
    const error = new Error('Update failed');
    const mockOnUpdateWithError = jest.fn().mockRejectedValueOnce(error);

    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdateWithError} />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(await screen.findByRole('alert')).toHaveTextContent('Update failed');
  });

  it('should disable form submission while submitting', async () => {
    const mockOnUpdateWithDelay = jest
      .fn()
      .mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdateWithDelay} />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should disable form submission while submitting', async () => {
    render(<ProfileEdit user={mockUser} onUpdate={mockOnUpdate} />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    const firstNameInput = screen.getByLabelText(/first name/i);

    await userEvent.clear(firstNameInput);
    await userEvent.type(firstNameInput, 'Updated');

    fireEvent.click(submitButton);
    expect(submitButton).toHaveAttribute('disabled');

    await waitFor(() => {
      expect(submitButton).not.toHaveAttribute('disabled');
    });
  });
});
