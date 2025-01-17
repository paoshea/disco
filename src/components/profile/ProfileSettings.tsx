import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { userService } from '@/services/api/user.service';

interface ProfileSettingsProps {
  user: User;
}

interface SettingsFormData {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  darkMode: boolean;
  twoFactorEnabled: boolean;
  locationSharing: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SettingsFormData>({
    defaultValues: {
      emailNotifications: user.settings?.emailNotifications ?? true,
      pushNotifications: user.settings?.pushNotifications ?? true,
      smsNotifications: user.settings?.smsNotifications ?? false,
      darkMode: user.settings?.darkMode ?? false,
      twoFactorEnabled: user.settings?.twoFactorEnabled ?? false,
      locationSharing: user.settings?.locationSharing ?? false,
      profileVisibility: user.settings?.profileVisibility ?? 'public',
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Update settings through the user service
      await userService.updateSettings(user.id, data);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings. Please try again.');
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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-500">Receive email updates about your account</p>
          </div>
          <Switch {...register('emailNotifications')} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
            <p className="text-sm text-gray-500">Receive push notifications on your devices</p>
          </div>
          <Switch {...register('pushNotifications')} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
            <p className="text-sm text-gray-500">Receive text messages for important updates</p>
          </div>
          <Switch {...register('smsNotifications')} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Dark Mode</h3>
            <p className="text-sm text-gray-500">Use dark theme across the application</p>
          </div>
          <Switch {...register('darkMode')} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <Switch {...register('twoFactorEnabled')} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Location Sharing</h3>
            <p className="text-sm text-gray-500">Share your location with friends</p>
          </div>
          <Switch {...register('locationSharing')} />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">Profile Visibility</h3>
          <p className="text-sm text-gray-500">Control who can see your profile</p>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="public"
                {...register('profileVisibility')}
                className="form-radio h-4 w-4 text-primary-600"
              />
              <span className="ml-2 text-sm text-gray-700">Public</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="private"
                {...register('profileVisibility')}
                className="form-radio h-4 w-4 text-primary-600"
              />
              <span className="ml-2 text-sm text-gray-700">Private</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="friends"
                {...register('profileVisibility')}
                className="form-radio h-4 w-4 text-primary-600"
              />
              <span className="ml-2 text-sm text-gray-700">Friends Only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={isSubmitting}>
          Save Settings
        </Button>
      </div>
    </form>
  );
};
