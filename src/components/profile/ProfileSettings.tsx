import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/user/user.service';
import type { User, UserPreferences } from '@/types/user';

interface ProfileSettingsProps {
  user: User;
}

const defaultPreferences: UserPreferences = {
  maxDistance: 50,
  ageRange: { min: 18, max: 100 },
  interests: [],
  gender: [],
  lookingFor: [],
  relationshipType: [],
  notifications: {
    matches: true,
    messages: true,
    events: true,
    safety: true,
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
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<UserPreferences>({
    defaultValues: user?.preferences || defaultPreferences,
  });
  const { toast } = useToast();

  const onSubmit = async (data: UserPreferences) => {
    try {
      setIsSubmitting(true);
      await userService.updateUserPreferences(user.id, data);
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Notification Settings
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="notifications.matches"
                className="block text-sm font-medium text-gray-700"
              >
                Match Notifications
              </label>
              <input
                type="checkbox"
                id="notifications.matches"
                {...register('notifications.matches')}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div>
              <label
                htmlFor="notifications.messages"
                className="block text-sm font-medium text-gray-700"
              >
                Message Notifications
              </label>
              <input
                type="checkbox"
                id="notifications.messages"
                {...register('notifications.messages')}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Safety Settings
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="safety.requireVerifiedMatch"
                className="block text-sm font-medium text-gray-700"
              >
                Require Verified Match
              </label>
              <input
                type="checkbox"
                id="safety.requireVerifiedMatch"
                {...register('safety.requireVerifiedMatch')}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
