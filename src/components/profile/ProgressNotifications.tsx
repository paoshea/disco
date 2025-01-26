
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/toast';
import { useEffect, useState } from 'react';
import type { ProgressNotification } from '@/services/notifications/notification.service';
import { progressNotificationService } from '@/services/notifications/notification.service';

export const ProgressNotifications: React.FC<{ userId: string }> = ({ userId }) => {
  const [notifications, setNotifications] = useState<ProgressNotification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const unread = await progressNotificationService.getUnreadNotifications(userId);
      setNotifications(unread);
    };

    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notificationId: string) => {
    await progressNotificationService.markAsRead(notificationId);
    setNotifications(notifications.filter((n) => n.id !== notificationId));
    toast({
      title: 'Notification marked as read',
      variant: 'default',
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Progress Updates</h3>
      {notifications.map((notification) => (
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
              onClick={() => handleMarkAsRead(notification.id)}
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
