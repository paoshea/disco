import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { LabeledSwitch } from '@/components/ui/LabeledSwitch';
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Maximum Distance (km)
            </label>
            <input
              type="number"
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
              <LabeledSwitch
                checked={watch('notifications.matches')}
                onChange={checked =>
                  handlePreferenceChange('matches', 'notifications', checked)
                }
                label="Match Notifications"
                description="Get notified when you have new matches"
              />
              <LabeledSwitch
                checked={watch('notifications.messages')}
                onChange={checked =>
                  handlePreferenceChange('messages', 'notifications', checked)
                }
                label="Message Notifications"
                description="Get notified when you receive new messages"
              />
              <LabeledSwitch
                checked={watch('notifications.events')}
                onChange={checked =>
                  handlePreferenceChange('events', 'notifications', checked)
                }
                label="Event Notifications"
                description="Get notified about upcoming events and activities"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Manage your privacy settings.
            </p>
            <div className="mt-4 space-y-4">
              <LabeledSwitch
                checked={watch('privacy.showOnlineStatus')}
                onChange={checked =>
                  handlePreferenceChange('showOnlineStatus', 'privacy', checked)
                }
                label="Show Online Status"
                description="Let others see when you're online"
              />
              <LabeledSwitch
                checked={watch('privacy.showLastSeen')}
                onChange={checked =>
                  handlePreferenceChange('showLastSeen', 'privacy', checked)
                }
                label="Show Last Seen"
                description="Let others see when you were last active"
              />
              <LabeledSwitch
                checked={watch('privacy.showLocation')}
                onChange={checked =>
                  handlePreferenceChange('showLocation', 'privacy', checked)
                }
                label="Show Location"
                description="Let others see your approximate location"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Safety Settings
            </label>
            <div className="mt-2 space-y-2">
              <LabeledSwitch
                checked={watch('safety.requireVerifiedMatch')}
                onChange={checked =>
                  setValue('safety.requireVerifiedMatch', checked)
                }
                label="Require Verified Match"
              />
              <LabeledSwitch
                checked={watch('safety.meetupCheckins')}
                onChange={checked => setValue('safety.meetupCheckins', checked)}
                label="Enable Meetup Check-ins"
              />
              <LabeledSwitch
                checked={watch('safety.emergencyContactAlerts')}
                onChange={checked =>
                  setValue('safety.emergencyContactAlerts', checked)
                }
                label="Enable Emergency Contact Alerts"
              />
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
