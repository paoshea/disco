import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserSettings } from '@/types/user';
import { userService } from '@/services/api/user.service';

interface MatchSettingsProps {
  initialSettings: UserSettings;
  userId: string;
  onUpdate: (settings: UserSettings) => void;
}

type MatchSettingsFormData = {
  discoveryRadius: number;
  ageRange: {
    min: number;
    max: number;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showLocation: boolean;
    showAge: boolean;
  };
  notifications: {
    matches: boolean;
    messages: boolean;
    meetupReminders: boolean;
    safetyAlerts: boolean;
  };
  safety: {
    requireVerifiedMatch: boolean;
    meetupCheckins: boolean;
    emergencyContactAlerts: boolean;
  };
};

export const MatchSettings: React.FC<MatchSettingsProps> = ({
  initialSettings,
  userId,
  onUpdate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchSettingsFormData>({
    defaultValues: initialSettings,
  });

  const onSubmit = async (data: MatchSettingsFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await userService.updateSettings(userId, data);
      onUpdate(data);
    } catch (error) {
      setError('Failed to update settings. Please try again.');
      console.error('Failed to update match settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={e => {
        void handleSubmit(onSubmit)(e);
      }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Discovery Settings
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="discoveryRadius"
              className="block text-sm font-medium text-gray-700"
            >
              Discovery Radius (km)
            </label>
            <input
              type="number"
              id="discoveryRadius"
              {...register('discoveryRadius', {
                valueAsNumber: true,
                min: { value: 1, message: 'Radius must be at least 1km' },
                max: { value: 100, message: 'Radius cannot exceed 100km' },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isSubmitting}
            />
            {errors.discoveryRadius && (
              <p className="mt-1 text-sm text-red-600">
                {errors.discoveryRadius.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Age Range
            </label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ageRangeMin" className="sr-only">
                  Minimum Age
                </label>
                <input
                  type="number"
                  id="ageRangeMin"
                  {...register('ageRange.min', {
                    valueAsNumber: true,
                    min: {
                      value: 18,
                      message: 'Must be at least 18 years old',
                    },
                    max: {
                      value: 100,
                      message: 'Must be less than 100 years old',
                    },
                  })}
                  placeholder="Min age"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  disabled={isSubmitting}
                />
                {errors.ageRange?.min && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.ageRange.min.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="ageRangeMax" className="sr-only">
                  Maximum Age
                </label>
                <input
                  type="number"
                  id="ageRangeMax"
                  {...register('ageRange.max', {
                    valueAsNumber: true,
                    min: {
                      value: 18,
                      message: 'Must be at least 18 years old',
                    },
                    max: {
                      value: 100,
                      message: 'Must be less than 100 years old',
                    },
                  })}
                  placeholder="Max age"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  disabled={isSubmitting}
                />
                {errors.ageRange?.max && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.ageRange.max.message}
                  </p>
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
            <label
              htmlFor="showOnlineStatus"
              className="ml-2 block text-sm text-gray-700"
            >
              Show my online status
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
            <label
              htmlFor="showLastSeen"
              className="ml-2 block text-sm text-gray-700"
            >
              Show when I was last seen
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
            <label
              htmlFor="showLocation"
              className="ml-2 block text-sm text-gray-700"
            >
              Show my location
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
            <label
              htmlFor="showAge"
              className="ml-2 block text-sm text-gray-700"
            >
              Show my age
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Notification Settings
        </h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyMatches"
              {...register('notifications.matches')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label
              htmlFor="notifyMatches"
              className="ml-2 block text-sm text-gray-700"
            >
              Notify me about new matches
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
            <label
              htmlFor="notifyMessages"
              className="ml-2 block text-sm text-gray-700"
            >
              Notify me about new messages
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
            <label
              htmlFor="notifyMeetups"
              className="ml-2 block text-sm text-gray-700"
            >
              Send me meetup reminders
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
            <label
              htmlFor="notifySafety"
              className="ml-2 block text-sm text-gray-700"
            >
              Send me safety alerts
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Safety Settings</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requireVerified"
              {...register('safety.requireVerifiedMatch')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label
              htmlFor="requireVerified"
              className="ml-2 block text-sm text-gray-700"
            >
              Only match with verified users
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableCheckins"
              {...register('safety.meetupCheckins')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label
              htmlFor="enableCheckins"
              className="ml-2 block text-sm text-gray-700"
            >
              Enable meetup check-ins
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyEmergencyContacts"
              {...register('safety.emergencyContactAlerts')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              disabled={isSubmitting}
            />
            <label
              htmlFor="notifyEmergencyContacts"
              className="ml-2 block text-sm text-gray-700"
            >
              Notify emergency contacts during alerts
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};
