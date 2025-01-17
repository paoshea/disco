import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Switch } from '@headlessui/react';
import { userService } from '@/services/api/user.service';
import type { User, UserPreferences } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/forms/Select';

interface ProfileSettingsProps {
  user: User;
}

const defaultPreferences: UserPreferences = {
  ageRange: {
    min: 18,
    max: 99,
  },
  maxDistance: 25,
  interests: [],
  eventTypes: [],
  notifications: {
    matches: true,
    messages: true,
    events: true,
    safety: true,
  },
};

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm<UserPreferences>({
    defaultValues: defaultPreferences,
  });
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const userPreferences = await userService.getPreferences(user.id);
        setPreferences(userPreferences);

        // Update form values
        Object.entries(userPreferences).forEach(([key, value]) => {
          setValue(key as keyof UserPreferences, value);
        });
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    void loadPreferences();
  }, [setValue, user.id]);

  const onSubmit = async (data: UserPreferences) => {
    setIsSubmitting(true);
    try {
      await userService.updatePreferences(user.id, data);
      setPreferences(data);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Discovery Settings</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Maximum Distance (miles)
            </label>
            <input
              type="number"
              {...register('maxDistance')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Age Range</label>
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
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        <div className="space-y-4">
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <Switch.Group key={key} as="div" className="flex items-center justify-between">
              <Switch.Label as="span" className="flex-grow">
                <span className="text-sm font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
              </Switch.Label>
              <Switch
                checked={watch(`notifications.${key as keyof typeof preferences.notifications}`)}
                onChange={v =>
                  setValue(`notifications.${key as keyof typeof preferences.notifications}`, v)
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
        <Button type="submit" disabled={isSubmitting} className="inline-flex justify-center">
          {isSubmitting ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </form>
  );
};
