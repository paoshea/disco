'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { notificationService } from '@/services/notification/notification.service';
import type { NotificationPreferences } from '@/types/notifications';

export default function NotificationsPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<NotificationPreferences>();

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await notificationService.getPreferences();
        Object.entries(prefs).forEach(([key, value]) => {
          setValue(key as keyof NotificationPreferences, value);
        });
      } catch (err) {
        setError('Failed to load notification preferences');
      }
    };

    loadPreferences();
  }, [setValue]);

  const onSubmit = async (data: NotificationPreferences) => {
    try {
      await notificationService.updatePreferences(data);
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      setSuccess(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Notification Settings</h1>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Push Notifications</label>
            <input
              type="checkbox"
              {...register('pushEnabled')}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Email Notifications</label>
            <input
              type="checkbox"
              {...register('emailEnabled')}
              className="h-4 w-4 text-blue-600 rounded"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-lg font-medium mb-4">Notification Categories</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Matches</label>
              <input
                type="checkbox"
                {...register('categories.matches')}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Messages</label>
              <input
                type="checkbox"
                {...register('categories.messages')}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Events</label>
              <input
                type="checkbox"
                {...register('categories.events')}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">System Updates</label>
              <input
                type="checkbox"
                {...register('categories.system')}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-lg font-medium mb-4">Quiet Hours</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Enable Quiet Hours</label>
              <input
                type="checkbox"
                {...register('quiet_hours.enabled')}
                className="h-4 w-4 text-blue-600 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  {...register('quiet_hours.start')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  {...register('quiet_hours.end')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
