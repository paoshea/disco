import { render, screen, fireEvent, waitFor } from '@/test-utils/integration';
import { act } from 'react-dom/test-utils';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import { eventService } from '@/services/event/event.service';
import { locationService } from '@/services/location/location.service';
import CreateEvent from '@app/events/create/page';
import EventDetails from '@app/events/[id]/page';
import { mockGeolocation } from '@/__tests__/__mocks__/geolocation';

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock geolocation hook
jest.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: jest.fn(),
}));

// Mock event service
jest.mock('@/services/event/event.service', () => ({
  eventService: {
    createEvent: jest.fn(),
    getEvent: jest.fn(),
    updateEvent: jest.fn(),
  },
}));

// Mock location service
jest.mock('@/services/location/location.service', () => ({
  locationService: {
    searchLocations: jest.fn(),
    validateLocation: jest.fn(),
  },
}));

describe('Event Creation Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '',
    query: {},
  };

  const mockLocation = {
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
  };

  const mockEvent = {
    id: 'event-123',
    title: 'Morning Run in Golden Gate Park',
    description: 'Join me for a casual 5k run!',
    eventType: 'running',
    startTime: '2025-02-01T08:00:00Z',
    endTime: '2025-02-01T09:30:00Z',
    location: {
      name: 'Golden Gate Park',
      latitude: 37.7694,
      longitude: -122.4862,
      address: 'Golden Gate Park, San Francisco, CA',
    },
    maxParticipants: 10,
    privacyLevel: 'public',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useGeolocation as jest.Mock).mockReturnValue({
      position: mockLocation,
      error: null,
      loading: false,
    });
  });

  it('completes the full event creation flow successfully', async () => {
    // Mock successful event creation
    (eventService.createEvent as jest.Mock).mockResolvedValueOnce(mockEvent);
    (locationService.searchLocations as jest.Mock).mockResolvedValueOnce([
      mockEvent.location,
    ]);
    (locationService.validateLocation as jest.Mock).mockResolvedValueOnce(true);

    const { rerender } = render(<CreateEvent />);

    // 1. Fill out basic event details
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/event title/i), {
        target: { value: mockEvent.title },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: mockEvent.description },
      });
      fireEvent.change(screen.getByLabelText(/event type/i), {
        target: { value: mockEvent.eventType },
      });
    });

    // 2. Set date and time
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/start date/i), {
        target: { value: '2025-02-01' },
      });
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: '08:00' },
      });
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: '09:30' },
      });
    });

    // 3. Set location
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/search location/i), {
        target: { value: 'Golden Gate Park' },
      });
      await waitFor(() => {
        expect(locationService.searchLocations).toHaveBeenCalledWith(
          'Golden Gate Park'
        );
      });
      fireEvent.click(screen.getByText(mockEvent.location.name));
    });

    // 4. Set participation limits and privacy
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/maximum participants/i), {
        target: { value: mockEvent.maxParticipants },
      });
      fireEvent.change(screen.getByLabelText(/privacy level/i), {
        target: { value: mockEvent.privacyLevel },
      });
    });

    // 5. Submit event creation form
    await act(async () => {
      fireEvent.submit(screen.getByRole('form'));
    });

    // Verify event creation API call
    await waitFor(() => {
      expect(eventService.createEvent).toHaveBeenCalledWith({
        title: mockEvent.title,
        description: mockEvent.description,
        eventType: mockEvent.eventType,
        startTime: mockEvent.startTime,
        endTime: mockEvent.endTime,
        location: mockEvent.location,
        maxParticipants: mockEvent.maxParticipants,
        privacyLevel: mockEvent.privacyLevel,
      });
    });

    // 6. Verify navigation to event details page
    expect(mockRouter.push).toHaveBeenCalledWith(`/events/${mockEvent.id}`);

    // 7. Check event details page rendering
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      pathname: '/events/[id]',
      query: { id: mockEvent.id },
    });
    (eventService.getEvent as jest.Mock).mockResolvedValueOnce(mockEvent);

    rerender(<EventDetails />);

    // Verify event details are displayed
    await waitFor(() => {
      expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
      expect(screen.getByText(mockEvent.description)).toBeInTheDocument();
      expect(screen.getByText(mockEvent.location.name)).toBeInTheDocument();
    });
  });

  it('handles location validation errors', async () => {
    // Mock location validation failure
    (locationService.validateLocation as jest.Mock).mockResolvedValueOnce(
      false
    );

    render(<CreateEvent />);

    // Fill out form with invalid location
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/search location/i), {
        target: { value: 'Invalid Location' },
      });
      fireEvent.submit(screen.getByRole('form'));
    });

    // Verify error message
    await waitFor(() => {
      expect(
        screen.getByText(/please select a valid location/i)
      ).toBeInTheDocument();
    });
  });

  it('handles form validation errors', async () => {
    render(<CreateEvent />);

    // Submit empty form
    await act(async () => {
      fireEvent.submit(screen.getByRole('form'));
    });

    // Check for validation errors
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/event type is required/i)).toBeInTheDocument();
    expect(screen.getByText(/start time is required/i)).toBeInTheDocument();
    expect(screen.getByText(/location is required/i)).toBeInTheDocument();
  });

  it('preserves form data on navigation', async () => {
    const { rerender } = render(<CreateEvent />);

    // Fill out form partially
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/event title/i), {
        target: { value: mockEvent.title },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: mockEvent.description },
      });
    });

    // Simulate navigation away and back
    rerender(<CreateEvent />);

    // Verify form data is preserved
    expect(screen.getByDisplayValue(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockEvent.description)).toBeInTheDocument();
  });

  it('handles API errors during event creation', async () => {
    // Mock API error
    (eventService.createEvent as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to create event')
    );

    render(<CreateEvent />);

    // Fill and submit form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/event title/i), {
        target: { value: mockEvent.title },
      });
      // ... fill other required fields ...
      fireEvent.submit(screen.getByRole('form'));
    });

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to create event/i)).toBeInTheDocument();
    });
  });
});
