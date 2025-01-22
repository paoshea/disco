import { render, screen, fireEvent, waitFor } from '@/test-utils/integration';
import { act } from 'react-dom/test-utils';
import { useRouter } from 'next/router';
import { useGeolocation } from '@/hooks/useGeolocation';
import { locationService } from '@/services/location/location.service';
import { privacyService } from '@/services/privacy/privacy.service';
import LocationSettings from '@/pages/settings/location';
import PrivacyZones from '@/pages/settings/privacy-zones';
import { mockGeolocation } from '@/__tests__/__mocks__/geolocation';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useGeolocation');
jest.mock('@/services/location/location.service');
jest.mock('@/services/privacy/privacy.service');

describe('Location Privacy Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '',
    query: {},
  };

  const mockPrivacyZone = {
    id: 'zone-123',
    name: 'Home',
    radius: 500,
    center: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    privacyLevel: 'hidden',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useGeolocation as jest.Mock).mockReturnValue({
      position: mockGeolocation,
      error: null,
      loading: false,
    });
  });

  it('completes the full location privacy setup flow', async () => {
    // Mock service responses
    (locationService.getCurrentLocation as jest.Mock).mockResolvedValueOnce(mockGeolocation);
    (privacyService.createPrivacyZone as jest.Mock).mockResolvedValueOnce(mockPrivacyZone);
    
    const { rerender } = render(<LocationSettings />);

    // 1. Configure location sharing settings
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/enable location sharing/i));
      fireEvent.change(screen.getByLabelText(/update frequency/i), {
        target: { value: '5' },
      });
      fireEvent.change(screen.getByLabelText(/location accuracy/i), {
        target: { value: 'high' },
      });
    });

    // Save location settings
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save settings/i }));
    });

    // Verify location settings update
    await waitFor(() => {
      expect(locationService.updateSettings).toHaveBeenCalledWith({
        enabled: true,
        updateFrequency: 5,
        accuracy: 'high',
      });
    });

    // 2. Navigate to privacy zones
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      pathname: '/settings/privacy-zones',
    });

    rerender(<PrivacyZones />);

    // Create new privacy zone
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add zone/i }));
      fireEvent.change(screen.getByLabelText(/zone name/i), {
        target: { value: mockPrivacyZone.name },
      });
      fireEvent.change(screen.getByLabelText(/radius/i), {
        target: { value: mockPrivacyZone.radius },
      });
      fireEvent.change(screen.getByLabelText(/privacy level/i), {
        target: { value: mockPrivacyZone.privacyLevel },
      });
    });

    // Use current location for zone center
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /use current location/i }));
    });

    // Save privacy zone
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save zone/i }));
    });

    // Verify privacy zone creation
    await waitFor(() => {
      expect(privacyService.createPrivacyZone).toHaveBeenCalledWith({
        name: mockPrivacyZone.name,
        radius: mockPrivacyZone.radius,
        center: mockPrivacyZone.center,
        privacyLevel: mockPrivacyZone.privacyLevel,
      });
    });
  });

  it('handles location permission denial', async () => {
    // Mock geolocation error
    (useGeolocation as jest.Mock).mockReturnValue({
      position: null,
      error: { code: 1, message: 'User denied geolocation' },
      loading: false,
    });

    render(<LocationSettings />);

    // Verify error message
    expect(screen.getByText(/location access is required/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request permission/i })).toBeInTheDocument();
  });

  it('validates privacy zone settings', async () => {
    render(<PrivacyZones />);

    // Try to save invalid zone
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add zone/i }));
      fireEvent.change(screen.getByLabelText(/radius/i), {
        target: { value: -1 }, // Invalid radius
      });
      fireEvent.click(screen.getByRole('button', { name: /save zone/i }));
    });

    // Verify validation errors
    expect(screen.getByText(/radius must be positive/i)).toBeInTheDocument();
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });

  it('handles overlapping privacy zones', async () => {
    // Mock existing overlapping zone
    (privacyService.checkZoneOverlap as jest.Mock).mockResolvedValueOnce(true);

    render(<PrivacyZones />);

    // Try to create overlapping zone
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /add zone/i }));
      fireEvent.change(screen.getByLabelText(/zone name/i), {
        target: { value: 'Overlapping Zone' },
      });
      fireEvent.change(screen.getByLabelText(/radius/i), {
        target: { value: 500 },
      });
      fireEvent.click(screen.getByRole('button', { name: /save zone/i }));
    });

    // Verify overlap warning
    await waitFor(() => {
      expect(screen.getByText(/zone overlaps with existing zone/i)).toBeInTheDocument();
    });
  });

  it('updates zone privacy levels', async () => {
    // Mock existing zone
    (privacyService.getPrivacyZones as jest.Mock).mockResolvedValueOnce([mockPrivacyZone]);

    render(<PrivacyZones />);

    // Change privacy level
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/privacy level/i), {
        target: { value: 'fuzzy' },
      });
      fireEvent.click(screen.getByRole('button', { name: /update/i }));
    });

    // Verify privacy level update
    await waitFor(() => {
      expect(privacyService.updatePrivacyZone).toHaveBeenCalledWith(
        mockPrivacyZone.id,
        expect.objectContaining({ privacyLevel: 'fuzzy' })
      );
    });
  });
});
