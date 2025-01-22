'use client';

import { useState, useEffect } from 'react';
import { notificationService } from '@/services/notification/notification.service';
import type { Notification } from '@/types/notifications';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const notifs = await notificationService.getNotifications();
        setNotifications(notifs);
      } catch (err) {
        setError('Failed to load notifications');
      }
    };

    loadNotifications();

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      setError('Failed to mark notification as read');
    }
  };

  const clearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
    } catch (err) {
      setError('Failed to clear notifications');
    }
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No notifications
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                notification.read
                  ? 'bg-white border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
              {notification.actionUrl && (
                <a
                  href={notification.actionUrl}
                  className="block mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
