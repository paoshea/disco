import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/Button';
import { userService } from '@/services/api/user.service';
import type { User, UserPreferences } from '@/types/user';

interface ProfileSettingsProps {
  user: User;
}

const defaultPreferences: UserPreferences = {
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
};

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm<UserPreferences>({
    defaultValues: {
      ...defaultPreferences,
      ...user.preferences,
    },
  });
  const { success, error: showError } = useToast();

  const handlePreferenceChange = useCallback(
    async (
      key:
        | keyof UserPreferences['notifications']
        | keyof UserPreferences['privacy'],
      section: 'notifications' | 'privacy',
      value: boolean
    ) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      try {
        const currentPreferences = user.preferences || defaultPreferences;
        const updatedPreferences: UserPreferences = {
          ...currentPreferences,
          [section]: {
            ...currentPreferences[section],
            [key]: value,
          },
        };

        await userService.updatePreferences(user.id, updatedPreferences);
        success({
          title: 'Settings updated',
          description: 'Your preferences have been saved successfully.',
        });
      } catch (err) {
        showError({
          title: 'Error updating settings',
          description: 'Failed to save your preferences. Please try again.',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, user, success, showError]
  );

  const onSubmit = async (data: UserPreferences) => {
    try {
      setIsSubmitting(true);
      await userService.updatePreferences(user.id, data);
      success({
        title: 'Settings updated',
        description: 'Your preferences have been saved successfully.',
      });
    } catch (error) {
      showError({
        title: 'Error updating settings',
        description: 'Failed to save your preferences. Please try again.',
      });
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
        <h3 className="text-lg font-medium">Profile Settings</h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="maxDistance"
              className="block text-sm font-medium text-gray-700"
            >
              Maximum Distance (km)
            </label>
            <input
              id="maxDistance"
              {...register('maxDistance')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Configure how you receive notifications.
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="notifications.matches"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Match Notifications
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you have new matches
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    id="notifications.matches"
                    type="checkbox"
                    {...register('notifications.matches')}
                    className="peer mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </label>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="notifications.messages"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Message Notifications
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive new messages
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    id="notifications.messages"
                    type="checkbox"
                    {...register('notifications.messages')}
                    className="peer mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </label>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="notifications.email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Email Notifications
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    id="notifications.email"
                    type="checkbox"
                    {...register('notifications.email')}
                    className="peer mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Manage your privacy settings.
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="privacy.showOnlineStatus"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Online Status
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Let others see when you're online
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    id="privacy.showOnlineStatus"
                    type="checkbox"
                    {...register('privacy.showOnlineStatus')}
                    className="peer mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </label>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="privacy.showLocation"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show Location
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Show your location to others
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    id="privacy.showLocation"
                    type="checkbox"
                    {...register('privacy.showLocation')}
                    className="peer mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Safety</h3>
            <p className="text-sm text-muted-foreground">
              Configure your safety settings.
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="safety.requireVerifiedMatch"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Require Verified Match
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Only match with verified users
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    id="safety.requireVerifiedMatch"
                    type="checkbox"
                    {...register('safety.requireVerifiedMatch')}
                    className="peer mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </label>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-0.5">
                  <label
                    htmlFor="safety.blockUnverifiedUsers"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Block Unverified Users
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Prevent unverified users from contacting you
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  <input
                    id="safety.blockUnverifiedUsers"
                    type="checkbox"
                    {...register('safety.blockUnverifiedUsers')}
                    className="peer mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
