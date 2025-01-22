import { render, screen, fireEvent, waitFor } from '@/test-utils/integration';
import { act } from 'react-dom/test-utils';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/user/user.service';
import { preferencesService } from '@/services/preferences/preferences.service';
import Register from '@/pages/auth/register';
import ProfileSetup from '@/pages/profile/setup';
import PreferencesSetup from '@/pages/profile/preferences';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}));

// Mock API client
jest.mock('@/services/api/api.client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

describe('User Registration Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('completes the full registration flow successfully', async () => {
    // 1. Start with Registration Page
    const { rerender } = render(<Register />);

    // Fill out registration form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' },
      });
      fireEvent.submit(screen.getByRole('form'));
    });

    // Verify registration API call
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'john@example.com',
        password: 'Password123!',
        redirect: false,
      });
    });

    // 2. Move to Profile Setup
    // Mock successful auth
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      pathname: '/profile/setup',
    });

    rerender(<ProfileSetup />);

    // Fill out profile form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/bio/i), {
        target: { value: 'I love outdoor activities!' },
      });
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: 'San Francisco' },
      });
      fireEvent.submit(screen.getByRole('form'));
    });

    // Verify profile update API call
    await waitFor(() => {
      expect(userService.updateProfile).toHaveBeenCalledWith(expect.any(String), {
        bio: 'I love outdoor activities!',
        location: 'San Francisco',
      });
    });

    // 3. Move to Preferences Setup
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      pathname: '/profile/preferences',
    });

    rerender(<PreferencesSetup />);

    // Fill out preferences form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/maximum distance/i), {
        target: { value: '25' },
      });
      fireEvent.change(screen.getByLabelText(/age range/i), {
        target: { value: '[25,35]' },
      });
      fireEvent.change(screen.getByLabelText(/activity types/i), {
        target: { value: ['hiking', 'running'] },
      });
      fireEvent.submit(screen.getByRole('form'));
    });

    // Verify preferences update API call
    await waitFor(() => {
      expect(preferencesService.updatePreferences).toHaveBeenCalledWith(
        expect.any(String),
        {
          maxDistance: 25,
          ageRange: [25, 35],
          activityTypes: ['hiking', 'running'],
        }
      );
    });

    // 4. Verify Completion
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles validation errors appropriately', async () => {
    render(<Register />);

    // Submit empty form
    await act(async () => {
      fireEvent.submit(screen.getByRole('form'));
    });

    // Check for validation errors
    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('handles API errors during registration', async () => {
    render(<Register />);

    // Mock API error
    (signIn as jest.Mock).mockRejectedValueOnce(new Error('Registration failed'));

    // Fill and submit form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' },
      });
      fireEvent.submit(screen.getByRole('form'));
    });

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

  it('preserves data between steps', async () => {
    const { rerender } = render(<Register />);

    // Fill registration form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.submit(screen.getByRole('form'));
    });

    // Move to profile setup
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      pathname: '/profile/setup',
    });

    rerender(<ProfileSetup />);

    // Verify data persistence
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });
});
