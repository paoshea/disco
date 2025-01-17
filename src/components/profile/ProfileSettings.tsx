import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserSettings } from '@/types/user';
import { userService } from '@/services/api/user.service';

interface ProfileSettingsProps {
  userId: string;
  initialSettings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
  onCancel: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userId,
  initialSettings,
  onUpdate,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSettings>({
    defaultValues: initialSettings,
  });

  const onSubmit = async (data: UserSettings) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await userService.updateSettings(userId, data);
      onUpdate(data);
    } catch (err) {
      setError('Failed to update settings. Please try again.');
      console.error('Error updating settings:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900">Discovery Settings</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="discoveryRadius" className="block text-sm font-medium text-gray-700">
              Discovery Radius (km)
            </label>
            <input
              type="number"
              id="discoveryRadius"
              {...register('discoveryRadius', {
                required: 'Discovery radius is required',
                min: { value: 1, message: 'Minimum radius is 1km' },
                max: { value: 100, message: 'Maximum radius is 100km' },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            {errors.discoveryRadius?.message && (
              <p className="mt-1 text-sm text-red-600">{errors.discoveryRadius.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age Range</label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ageMin" className="block text-sm text-gray-500">
                  Minimum Age
                </label>
                <input
                  type="number"
                  id="ageMin"
                  {...register('ageRange.min', {
                    required: 'Minimum age is required',
                    min: { value: 18, message: 'Must be at least 18' },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  disabled={isSubmitting}
                />
                {errors.ageRange?.min?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.ageRange.min.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="ageMax" className="block text-sm text-gray-500">
                  Maximum Age
                </label>
                <input
                  type="number"
                  id="ageMax"
                  {...register('ageRange.max', {
                    required: 'Maximum age is required',
                    min: { value: 18, message: 'Must be at least 18' },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  disabled={isSubmitting}
                />
                {errors.ageRange?.max?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.ageRange.max.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showOnlineStatus"
              {...register('privacy.showOnlineStatus')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label htmlFor="showOnlineStatus" className="ml-2 block text-sm text-gray-700">
              Show online status to matches
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showLastSeen"
              {...register('privacy.showLastSeen')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label htmlFor="showLastSeen" className="ml-2 block text-sm text-gray-700">
              Show last seen status
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showLocation"
              {...register('privacy.showLocation')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label htmlFor="showLocation" className="ml-2 block text-sm text-gray-700">
              Show location to matches
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showAge"
              {...register('privacy.showAge')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label htmlFor="showAge" className="ml-2 block text-sm text-gray-700">
              Show age to matches
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyMatches"
              {...register('notifications.matches')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label htmlFor="notifyMatches" className="ml-2 block text-sm text-gray-700">
              New match notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyMessages"
              {...register('notifications.messages')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label htmlFor="notifyMessages" className="ml-2 block text-sm text-gray-700">
              Message notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyMeetups"
              {...register('notifications.meetupReminders')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label htmlFor="notifyMeetups" className="ml-2 block text-sm text-gray-700">
              Meetup reminders
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifySafety"
              {...register('notifications.safetyAlerts')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label htmlFor="notifySafety" className="ml-2 block text-sm text-gray-700">
              Safety alerts
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};
