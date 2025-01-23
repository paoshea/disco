import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notification/notification.service';
import type { Notification } from '@/types/notifications';

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        const data = await notificationService.getNotifications(user.id);
        setNotifications(data);
      } catch (err) {
        setError('Failed to load notifications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      await notificationService.markAsRead(user.id, notificationId);
      setNotifications(
        notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="text-center py-4">Loading notifications...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="text-center text-red-500 py-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No notifications</div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{notification.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{notification.message}</p>
                {!notification.read && (
                  <button
                    onClick={() => void handleMarkAsRead(notification.id)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
