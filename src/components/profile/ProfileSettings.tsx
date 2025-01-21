import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Switch } from '@/components/ui/Switch';
import { userService } from '@/services/api/user.service';
import type { User, UserPreferences } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/use-toast';

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
    defaultValues: user.preferences || defaultPreferences,
  });

  const onSubmit = async (data: UserPreferences) => {
    try {
      setIsSubmitting(true);
      await userService.updatePreferences(user.id, data);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
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
            <label className="block text-sm font-medium text-gray-700">
              Privacy Settings
            </label>
            <div className="mt-2 space-y-2">
              <Switch
                checked={watch('privacy.showOnlineStatus')}
                onChange={(checked) => setValue('privacy.showOnlineStatus', checked)}
                label="Show Online Status"
              />
              <Switch
                checked={watch('privacy.showLastSeen')}
                onChange={(checked) => setValue('privacy.showLastSeen', checked)}
                label="Show Last Seen"
              />
              <Switch
                checked={watch('privacy.showLocation')}
                onChange={(checked) => setValue('privacy.showLocation', checked)}
                label="Show Location"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Safety Settings
            </label>
            <div className="mt-2 space-y-2">
              <Switch
                checked={watch('safety.requireVerifiedMatch')}
                onChange={(checked) => setValue('safety.requireVerifiedMatch', checked)}
                label="Require Verified Match"
              />
              <Switch
                checked={watch('safety.meetupCheckins')}
                onChange={(checked) => setValue('safety.meetupCheckins', checked)}
                label="Enable Meetup Check-ins"
              />
              <Switch
                checked={watch('safety.emergencyContactAlerts')}
                onChange={(checked) => setValue('safety.emergencyContactAlerts', checked)}
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
