import { render, screen, fireEvent, waitFor } from '@/test-utils/integration';
import { act } from 'react-dom/test-utils';
import { useRouter } from 'next/navigation';
import { matchingService } from '@/services/matching/matching.service';
import { preferencesService } from '@/services/preferences/preferences.service';
import { notificationService } from '@/services/notification/notification.service';
import MatchPreferences from '@app/settings/match-preferences/page';
import MatchList from '@app/matches/page';
import MatchDetails from '@app/matches/[id]/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/matching/matching.service');
jest.mock('@/services/preferences/preferences.service');
jest.mock('@/services/notification/notification.service');

describe('Matching System Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '',
    query: {},
  };

  const mockPreferences = {
    activityTypes: ['running', 'hiking'],
    maxDistance: 10,
    ageRange: [25, 35],
    availability: ['weekend_morning', 'weekend_afternoon'],
    experienceLevel: 'intermediate',
  };

  const mockMatch = {
    id: 'match-123',
    userId: 'user-456',
    name: 'John Doe',
    matchScore: 0.85,
    commonInterests: ['running'],
    lastActive: new Date().toISOString(),
    status: 'pending',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('completes the full matching flow', async () => {
    // Mock service responses
    (preferencesService.getPreferences as jest.Mock).mockResolvedValueOnce(
      mockPreferences
    );
    (matchingService.findMatches as jest.Mock).mockResolvedValueOnce([
      mockMatch,
    ]);

    const { rerender } = render(<MatchPreferences />);

    // 1. Set up matching preferences
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/activity types/i), {
        target: { value: mockPreferences.activityTypes },
      });
      fireEvent.change(screen.getByLabelText(/maximum distance/i), {
        target: { value: mockPreferences.maxDistance },
      });
      fireEvent.change(screen.getByLabelText(/age range/i), {
        target: { value: mockPreferences.ageRange },
      });
      fireEvent.change(screen.getByLabelText(/availability/i), {
        target: { value: mockPreferences.availability },
      });
      fireEvent.change(screen.getByLabelText(/experience level/i), {
        target: { value: mockPreferences.experienceLevel },
      });
    });

    // Save preferences
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /save preferences/i })
      );
    });

    // Verify preferences update
    await waitFor(() => {
      expect(preferencesService.updatePreferences).toHaveBeenCalledWith(
        expect.any(String),
        mockPreferences
      );
    });

    // 2. Navigate to matches list
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      pathname: '/matches',
    });

    rerender(<MatchList />);

    // Verify matches are loaded
    await waitFor(() => {
      expect(screen.getByText(mockMatch.name)).toBeInTheDocument();
      expect(
        screen.getByText(`${mockMatch.matchScore * 100}% Match`)
      ).toBeInTheDocument();
    });

    // 3. View match details
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      pathname: '/matches/[id]',
      query: { id: mockMatch.id },
    });

    (matchingService.getMatchDetails as jest.Mock).mockResolvedValueOnce({
      ...mockMatch,
      bio: 'I love outdoor activities!',
      recentActivities: ['5k run', 'Mountain hike'],
    });

    rerender(<MatchDetails />);

    // Verify match details
    await waitFor(() => {
      expect(
        screen.getByText(/i love outdoor activities!/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/5k run/i)).toBeInTheDocument();
    });

    // 4. Send match request
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send request/i }));
    });

    // Verify match request
    await waitFor(() => {
      expect(matchingService.sendMatchRequest).toHaveBeenCalledWith(
        mockMatch.id
      );
      expect(notificationService.sendNotification).toHaveBeenCalledWith(
        mockMatch.userId,
        expect.any(String)
      );
    });
  });

  it('handles preference validation', async () => {
    render(<MatchPreferences />);

    // Try to save invalid preferences
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/maximum distance/i), {
        target: { value: -1 }, // Invalid distance
      });
      fireEvent.click(
        screen.getByRole('button', { name: /save preferences/i })
      );
    });

    // Verify validation errors
    expect(screen.getByText(/distance must be positive/i)).toBeInTheDocument();
  });

  it('handles no matches found', async () => {
    // Mock empty matches response
    (matchingService.findMatches as jest.Mock).mockResolvedValueOnce([]);

    render(<MatchList />);

    // Verify no matches message
    await waitFor(() => {
      expect(screen.getByText(/no matches found/i)).toBeInTheDocument();
      expect(
        screen.getByText(/try adjusting your preferences/i)
      ).toBeInTheDocument();
    });
  });

  it('handles match request errors', async () => {
    // Mock match request error
    (matchingService.sendMatchRequest as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to send request')
    );

    render(<MatchDetails />);

    // Try to send match request
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send request/i }));
    });

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/failed to send request/i)).toBeInTheDocument();
    });
  });

  it('updates match status in real-time', async () => {
    const { rerender } = render(<MatchList />);

    // Mock match status update
    const updatedMatch = { ...mockMatch, status: 'accepted' };
    (matchingService.getMatchUpdates as jest.Mock).mockImplementation(
      callback => {
        callback(updatedMatch);
      }
    );

    // Verify status update
    await waitFor(() => {
      expect(screen.getByText(/accepted/i)).toBeInTheDocument();
    });

    // Navigate to match details
    rerender(<MatchDetails />);

    // Verify updated status in details
    await waitFor(() => {
      expect(screen.getByText(/accepted/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /start chat/i })
      ).toBeInTheDocument();
    });
  });
});
