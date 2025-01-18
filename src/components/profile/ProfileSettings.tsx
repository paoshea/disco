import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Switch } from '@headlessui/react';
import { userService } from '@/services/api/user.service';
import type { User, UserPreferences } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';

interface ProfileSettingsProps {
  user: User;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm<UserPreferences>({
    defaultValues: {
      maxDistance: 50,
      ageRange: { min: 18, max: 99 },
      interests: [],
      gender: [],
      lookingFor: [],
      relationshipType: [],
      notifications: {
        matches: false,
        messages: false,
        events: false,
        safety: false,
      },
      privacy: {
        showOnlineStatus: true,
        showLastSeen: true,
        showLocation: true,
        showAge: true,
      },
      safety: {
        requireVerifiedMatch: true,
        meetupCheckins: true,
        emergencyContactAlerts: true,
      },
    },
  });
  const [settings, setSettings] = useState<UserPreferences>({
    maxDistance: 50,
    ageRange: { min: 18, max: 99 },
    interests: [],
    gender: [],
    lookingFor: [],
    relationshipType: [],
    notifications: {
      matches: false,
      messages: false,
      events: false,
      safety: false,
    },
    privacy: {
      showOnlineStatus: true,
      showLastSeen: true,
      showLocation: true,
      showAge: true,
    },
    safety: {
      requireVerifiedMatch: true,
      meetupCheckins: true,
      emergencyContactAlerts: true,
    },
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userPreferences = await userService.getPreferences(user.id);
        const newSettings: UserPreferences = {
          maxDistance: userPreferences?.maxDistance || 50,
          ageRange: userPreferences?.ageRange || { min: 18, max: 99 },
          interests: userPreferences?.interests || [],
          gender: userPreferences?.gender || [],
          lookingFor: userPreferences?.lookingFor || [],
          relationshipType: userPreferences?.relationshipType || [],
          notifications: {
            matches: userPreferences?.notifications?.matches || false,
            messages: userPreferences?.notifications?.messages || false,
            events: userPreferences?.notifications?.events || false,
            safety: userPreferences?.notifications?.safety || false,
          },
          privacy: {
            showOnlineStatus:
              userPreferences?.privacy?.showOnlineStatus || true,
            showLastSeen: userPreferences?.privacy?.showLastSeen || true,
            showLocation: userPreferences?.privacy?.showLocation || true,
            showAge: userPreferences?.privacy?.showAge || true,
          },
          safety: {
            requireVerifiedMatch:
              userPreferences?.safety?.requireVerifiedMatch || true,
            meetupCheckins: userPreferences?.safety?.meetupCheckins || true,
            emergencyContactAlerts:
              userPreferences?.safety?.emergencyContactAlerts || true,
          },
        };
        setSettings(newSettings);

        // Handle nested objects when setting form values
        type SettingsPath =
          | keyof UserPreferences
          | 'ageRange.min'
          | 'ageRange.max'
          | 'notifications.matches'
          | 'notifications.messages'
          | 'notifications.events'
          | 'notifications.safety'
          | 'privacy.showOnlineStatus'
          | 'privacy.showLastSeen'
          | 'privacy.showLocation'
          | 'privacy.showAge'
          | 'safety.requireVerifiedMatch'
          | 'safety.meetupCheckins'
          | 'safety.emergencyContactAlerts';

        const setNestedValues = (
          obj: Partial<UserPreferences>,
          prefix = ''
        ) => {
          Object.entries(obj).forEach(([key, value]) => {
            const path = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              setNestedValues(value as Partial<UserPreferences>, path);
            } else {
              setValue(path as SettingsPath, value);
            }
          });
        };

        setNestedValues(newSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    void loadSettings();
  }, [setValue, user.id]);

  const onSubmit = async (data: UserPreferences) => {
    setIsSubmitting(true);
    try {
      const updatedPreferences: UserPreferences = {
        maxDistance: data.maxDistance,
        ageRange: data.ageRange,
        interests: data.interests || [],
        gender: data.gender || [],
        lookingFor: data.lookingFor || [],
        relationshipType: data.relationshipType || [],
        notifications: {
          matches: data.notifications?.matches || false,
          messages: data.notifications?.messages || false,
          events: data.notifications?.events || false,
          safety: data.notifications?.safety || false,
        },
        privacy: {
          showOnlineStatus: data.privacy?.showOnlineStatus || true,
          showLastSeen: data.privacy?.showLastSeen || true,
          showLocation: data.privacy?.showLocation || true,
          showAge: data.privacy?.showAge || true,
        },
        safety: {
          requireVerifiedMatch: data.safety?.requireVerifiedMatch || true,
          meetupCheckins: data.safety?.meetupCheckins || true,
          emergencyContactAlerts: data.safety?.emergencyContactAlerts || true,
        },
      };

      await userService.updatePreferences(user.id, updatedPreferences);
      setSettings(updatedPreferences);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
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
              {...register('maxDistance')}
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
