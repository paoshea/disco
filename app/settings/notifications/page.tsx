'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notification/notification.service';
import type { NotificationPreferences } from '@/types/notifications';

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      try {
        const prefs = await notificationService.getSettings(user.id);
        setPreferences(prefs);
      } catch (err) {
        setError('Failed to load notification preferences');
        console.error(err);
      }
    };

    void loadPreferences();
  }, [user]);

  const handleToggle = async (
    key: string,
    section: 'categories' | 'delivery' | 'quiet_hours' = 'categories'
  ) => {
    if (!preferences || !user) return;

    try {
      setError(null);
      setSuccess(false);

      const updatedPreferences = { ...preferences };

      if (section === 'categories') {
        updatedPreferences.categories = {
          ...preferences.categories,
          [key]:
            !preferences.categories[key as keyof typeof preferences.categories],
        };
      } else if (section === 'delivery') {
        updatedPreferences[key as 'pushEnabled' | 'emailEnabled'] =
          !preferences[key as 'pushEnabled' | 'emailEnabled'];
      } else if (section === 'quiet_hours') {
        updatedPreferences.quiet_hours = {
          enabled: !preferences.quiet_hours.enabled,
          start: preferences.quiet_hours.start,
          end: preferences.quiet_hours.end,
        };
      }

      await notificationService.updateSettings(user.id, updatedPreferences);
      setPreferences(updatedPreferences);
      setSuccess(true);
    } catch (err) {
      setError('Failed to update notification preferences');
      console.error(err);
    }
  };

  const handleQuietHoursChange = async (
    field: 'start' | 'end',
    value: string
  ) => {
    if (!preferences || !user) return;

    try {
      setError(null);
      setSuccess(false);

      const updatedPreferences = {
        ...preferences,
        quiet_hours: {
          enabled: preferences.quiet_hours.enabled,
          start: field === 'start' ? value : preferences.quiet_hours.start,
          end: field === 'end' ? value : preferences.quiet_hours.end,
        },
      };

      await notificationService.updateSettings(user.id, updatedPreferences);
      setPreferences(updatedPreferences);
      setSuccess(true);
    } catch (err) {
      setError('Failed to update quiet hours');
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="p-4">
        <p>Please sign in to manage your notification preferences.</p>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-4">
        <p>Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Settings updated successfully!
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Notification Categories</h2>
          <div className="space-y-4">
            {Object.entries(preferences.categories).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => void handleToggle(key)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700 capitalize">{key}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Delivery Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailEnabled}
                  onChange={() => void handleToggle('emailEnabled', 'delivery')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Email Notifications</span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushEnabled}
                  onChange={() => void handleToggle('pushEnabled', 'delivery')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Push Notifications</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Quiet Hours</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.quiet_hours.enabled}
                  onChange={() => void handleToggle('enabled', 'quiet_hours')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Enable Quiet Hours</span>
              </label>
            </div>

            {preferences.quiet_hours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours.start}
                    onChange={e =>
                      void handleQuietHoursChange('start', e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours.end}
                    onChange={e =>
                      void handleQuietHoursChange('end', e.target.value)
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
