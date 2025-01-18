import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Switch } from '@headlessui/react';
import { userService } from '@/services/api/user.service';
import type { User, UserSettings, UserPreferences } from '@/types/user';
import { Button } from '@/components/ui/Button';

interface ProfileSettingsProps {
  user: User;
}

const defaultSettings: UserSettings = {
  discoveryRadius: 25,
  ageRange: {
    min: 18,
    max: 99,
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    showLocation: true,
    showAge: true,
  },
  notifications: {
    matches: true,
    messages: true,
    meetupReminders: true,
    safetyAlerts: true,
  },
  safety: {
    requireVerifiedMatch: true,
    meetupCheckins: true,
    emergencyContactAlerts: true,
  },
};

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm<UserSettings>({
    defaultValues: defaultSettings,
  });
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userPreferences = await userService.getPreferences(user.id);
        const settings: UserSettings = {
          discoveryRadius: userPreferences.maxDistance,
          ageRange: userPreferences.ageRange,
          privacy: {
            showOnlineStatus: true,
            showLastSeen: true,
            showLocation: true,
            showAge: true,
          },
          notifications: {
            matches: userPreferences.notifications.matches,
            messages: userPreferences.notifications.messages,
            meetupReminders: true,
            safetyAlerts: true,
          },
          safety: {
            requireVerifiedMatch: true,
            meetupCheckins: true,
            emergencyContactAlerts: true,
          },
        };
        setSettings(settings);

        // Handle nested objects when setting form values
        type SettingsPath =
          | keyof UserSettings
          | 'ageRange.min'
          | 'ageRange.max'
          | 'privacy.showOnlineStatus'
          | 'privacy.showLastSeen'
          | 'privacy.showLocation'
          | 'privacy.showAge'
          | 'notifications.matches'
          | 'notifications.messages'
          | 'notifications.meetupReminders'
          | 'notifications.safetyAlerts'
          | 'safety.requireVerifiedMatch'
          | 'safety.meetupCheckins'
          | 'safety.emergencyContactAlerts';

        const setNestedValues = (obj: Partial<UserSettings>, prefix = '') => {
          Object.entries(obj).forEach(([key, value]) => {
            const path = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              setNestedValues(value as Partial<UserSettings>, path);
            } else {
              setValue(path as SettingsPath, value);
            }
          });
        };

        setNestedValues(settings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    void loadSettings();
  }, [setValue, user.id]);

  const onSubmit = async (data: UserSettings) => {
    setIsSubmitting(true);
    try {
      const preferences: UserPreferences = {
        maxDistance: data.discoveryRadius,
        ageRange: data.ageRange,
        interests: [], // Maintain existing interests
        eventTypes: [], // Maintain existing event types
        notifications: {
          matches: data.notifications.matches,
          messages: data.notifications.messages,
          events: true,
          safety: true,
        },
      };
      await userService.updatePreferences(user.id, preferences);
      setSettings(data);
    } catch (error) {
      console.error('Error updating settings:', error);
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
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Discovery Settings
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discovery Radius (miles)
            </label>
            <input
              type="number"
              {...register('discoveryRadius')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Age Range
            </label>
            <div className="mt-1 grid grid-cols-2 gap-4">
              <input
                type="number"
                {...register('ageRange.min')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Min"
              />
              <input
                type="number"
                {...register('ageRange.max')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
        <div className="space-y-4">
          {Object.entries(settings.privacy).map(([key, value]) => (
            <Switch.Group
              key={key}
              as="div"
              className="flex items-center justify-between"
            >
              <Switch.Label as="span" className="flex-grow">
                <span className="text-sm font-medium text-gray-900">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())}
                </span>
              </Switch.Label>
              <Switch
                checked={watch(
                  `privacy.${key as keyof typeof settings.privacy}`
                )}
                onChange={v =>
                  setValue(`privacy.${key as keyof typeof settings.privacy}`, v)
                }
                className={`${
                  value ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    value ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </Switch.Group>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Notification Settings
        </h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <Switch.Group
              key={key}
              as="div"
              className="flex items-center justify-between"
            >
              <Switch.Label as="span" className="flex-grow">
                <span className="text-sm font-medium text-gray-900">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())}
                </span>
              </Switch.Label>
              <Switch
                checked={watch(
                  `notifications.${key as keyof typeof settings.notifications}`
                )}
                onChange={v =>
                  setValue(
                    `notifications.${key as keyof typeof settings.notifications}`,
                    v
                  )
                }
                className={`${
                  value ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    value ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </Switch.Group>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Safety Settings</h3>
        <div className="space-y-4">
          {Object.entries(settings.safety).map(([key, value]) => (
            <Switch.Group
              key={key}
              as="div"
              className="flex items-center justify-between"
            >
              <Switch.Label as="span" className="flex-grow">
                <span className="text-sm font-medium text-gray-900">
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())}
                </span>
              </Switch.Label>
              <Switch
                checked={watch(`safety.${key as keyof typeof settings.safety}`)}
                onChange={v =>
                  setValue(`safety.${key as keyof typeof settings.safety}`, v)
                }
                className={`${
                  value ? 'bg-primary-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    value ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </Switch>
            </Switch.Group>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center"
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
};
