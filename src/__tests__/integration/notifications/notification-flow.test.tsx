import { render, screen, fireEvent, waitFor } from '@/test-utils/integration';
import { act } from 'react-dom/test-utils';
import { useRouter } from 'next/navigation';
import { notificationService } from '@/services/notification/notification.service';
import { webSocketService } from '@/services/websocket/websocket.service';
import NotificationSettings from '@app/settings/notifications/page';
import NotificationCenter from '@app/components/notifications/NotificationCenter';
import { mockPushNotification } from '@/__tests__/__mocks__/notifications';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/notification/notification.service');
jest.mock('@/services/websocket/websocket.service');

describe('Notification System Flow', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '',
    query: {},
  };

  const mockSettings = {
    pushEnabled: true,
    emailEnabled: true,
    categories: {
      matches: true,
      messages: true,
      events: true,
      system: true,
    },
    quiet_hours: {
      enabled: true,
      start: '22:00',
      end: '07:00',
    },
  };

  const mockNotification = {
    id: 'notif-123',
    type: 'match_request',
    title: 'New Match Request',
    message: 'John Doe wants to connect with you',
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: '/matches/user-456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('completes the full notification setup and handling flow', async () => {
    // Mock service responses
    (notificationService.getSettings as jest.Mock).mockResolvedValueOnce(mockSettings);
    (notificationService.getNotifications as jest.Mock).mockResolvedValueOnce([mockNotification]);
    
    const { rerender } = render(<NotificationSettings />);

    // 1. Configure notification settings
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/enable push notifications/i));
      fireEvent.click(screen.getByLabelText(/enable email notifications/i));
      
      // Configure categories
      Object.keys(mockSettings.categories).forEach((category) => {
        fireEvent.click(screen.getByLabelText(new RegExp(category, 'i')));
      });

      // Set quiet hours
      fireEvent.click(screen.getByLabelText(/enable quiet hours/i));
      fireEvent.change(screen.getByLabelText(/start time/i), {
        target: { value: mockSettings.quiet_hours.start },
      });
      fireEvent.change(screen.getByLabelText(/end time/i), {
        target: { value: mockSettings.quiet_hours.end },
      });
    });

    // Save settings
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save settings/i }));
    });

    // Verify settings update
    await waitFor(() => {
      expect(notificationService.updateSettings).toHaveBeenCalledWith(mockSettings);
    });

    // 2. Test push notification permission
    await act(async () => {
      // Mock push notification permission request
      global.Notification = {
        requestPermission: jest.fn().mockResolvedValueOnce('granted'),
        permission: 'granted',
      } as any;

      fireEvent.click(screen.getByRole('button', { name: /enable push notifications/i }));
    });

    // Verify push notification setup
    await waitFor(() => {
      expect(notificationService.registerPushSubscription).toHaveBeenCalled();
    });

    // 3. Navigate to notification center
    rerender(<NotificationCenter />);

    // Verify notifications are loaded
    await waitFor(() => {
      expect(screen.getByText(mockNotification.title)).toBeInTheDocument();
      expect(screen.getByText(mockNotification.message)).toBeInTheDocument();
    });

    // 4. Test real-time notification
    const newNotification = {
      ...mockNotification,
      id: 'notif-124',
      title: 'New Event Nearby',
      type: 'event_notification',
    };

    // Simulate WebSocket notification
    await act(async () => {
      webSocketService.emit('notification', newNotification);
    });

    // Verify new notification appears
    await waitFor(() => {
      expect(screen.getByText(newNotification.title)).toBeInTheDocument();
    });

    // 5. Test notification interaction
    await act(async () => {
      fireEvent.click(screen.getByText(newNotification.title));
    });

    // Verify notification marked as read
    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith(newNotification.id);
      expect(mockRouter.push).toHaveBeenCalledWith(newNotification.actionUrl);
    });
  });

  it('handles notification permission denial', async () => {
    // Mock denied notification permission
    global.Notification = {
      requestPermission: jest.fn().mockResolvedValueOnce('denied'),
      permission: 'denied',
    } as any;

    render(<NotificationSettings />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /enable push notifications/i }));
    });

    // Verify permission denied message
    expect(screen.getByText(/notification permission denied/i)).toBeInTheDocument();
  });

  it('handles quiet hours correctly', async () => {
    // Mock current time within quiet hours
    jest.useFakeTimers().setSystemTime(new Date('2025-01-22T23:00:00'));

    (notificationService.getSettings as jest.Mock).mockResolvedValueOnce(mockSettings);

    render(<NotificationCenter />);

    // Simulate incoming notification during quiet hours
    await act(async () => {
      webSocketService.emit('notification', mockNotification);
    });

    // Verify notification is queued but not displayed
    await waitFor(() => {
      expect(screen.queryByText(mockNotification.title)).not.toBeInTheDocument();
      expect(notificationService.queueNotification).toHaveBeenCalledWith(mockNotification);
    });
  });

  it('handles notification grouping', async () => {
    // Mock multiple notifications from same source
    const notifications = [
      { ...mockNotification, id: 'notif-1' },
      { ...mockNotification, id: 'notif-2' },
      { ...mockNotification, id: 'notif-3' },
    ];

    (notificationService.getNotifications as jest.Mock).mockResolvedValueOnce(notifications);

    render(<NotificationCenter />);

    // Verify notifications are grouped
    await waitFor(() => {
      expect(screen.getByText(/3 notifications from john doe/i)).toBeInTheDocument();
    });

    // Expand group
    await act(async () => {
      fireEvent.click(screen.getByText(/3 notifications from john doe/i));
    });

    // Verify all notifications visible
    notifications.forEach((notification) => {
      expect(screen.getByTestId(`notification-${notification.id}`)).toBeInTheDocument();
    });
  });

  it('handles offline notification queueing', async () => {
    // Mock offline status
    Object.defineProperty(navigator, 'onLine', { value: false });

    render(<NotificationCenter />);

    // Simulate notification while offline
    await act(async () => {
      webSocketService.emit('notification', mockNotification);
    });

    // Verify notification is queued
    await waitFor(() => {
      expect(notificationService.queueOfflineNotification).toHaveBeenCalledWith(
        mockNotification
      );
    });

    // Simulate coming back online
    await act(async () => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    });

    // Verify queued notifications are processed
    await waitFor(() => {
      expect(notificationService.processOfflineQueue).toHaveBeenCalled();
      expect(screen.getByText(mockNotification.title)).toBeInTheDocument();
    });
  });
});
