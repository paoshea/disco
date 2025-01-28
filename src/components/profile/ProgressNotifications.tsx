import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/toast';
import type { ProgressNotification } from '@/services/notifications/notification.service';
import { progressNotificationService } from '@/services/notifications/notification.service';

interface ProgressNotificationsProps {
  userId: string;
}

export const ProgressNotifications = ({
  userId,
}: ProgressNotificationsProps) => {
  const [notifications, setNotifications] = useState<ProgressNotification[]>(
    []
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const unread =
          await progressNotificationService.getUnreadNotifications(userId);
        setNotifications(unread);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    void fetchNotifications(); // Use void operator to mark promise as intentionally not awaited
  }, [userId]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await progressNotificationService.markAsRead(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success('Notification marked as read'); // Correct toast call
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Progress Updates</h3>
      {notifications.map(notification => (
        <Card key={notification.id} className="p-4 relative">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{notification.title}</h4>
              <p className="text-sm text-gray-600">{notification.message}</p>
              {notification.reward && (
                <Badge variant="achievement" type="engagement">
                  +{notification.reward.value} {notification.reward.type}
                </Badge>
              )}
            </div>
            <button
              onClick={() => void handleMarkAsRead(notification.id)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark as read
            </button>
          </div>
        </Card>
      ))}
      {notifications.length === 0 && (
        <p className="text-gray-500 text-center py-4">No new notifications</p>
      )}
    </div>
  );
};
