import React from 'react';
import { useForm } from 'react-hook-form';
import { User, UserSettings } from '@/types/user';
import { userService } from '@/services/api/user.service';

interface ProfileEditProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  interests: string[];
  settings: UserSettings;
}

export const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onUpdate }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || '',
      interests: user.interests,
      settings: {
        discoveryRadius: 50,
        ageRange: { min: 18, max: 100 },
        notifications: {
          matches: true,
          messages: true,
          nearbyUsers: true,
          safetyAlerts: true,
        },
        privacy: {
          showLocation: true,
          showAge: true,
          showLastActive: true,
          showVerificationStatus: true,
        },
        safety: {
          autoShareLocation: false,
          meetupCheckins: true,
          sosAlertEnabled: true,
          requireVerifiedMatch: true,
        },
      },
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const updatedUser = await userService.updateProfile({
        ...user,
        ...data,
      });
      onUpdate(updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            {...register('firstName', { required: 'First name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            {...register('lastName', { required: 'Last name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          {...register('bio')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Tell others about yourself..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Interests</label>
        <div className="mt-2 space-y-2">
          {['Music', 'Sports', 'Art', 'Technology', 'Travel', 'Food', 'Movies', 'Books'].map((interest) => (
            <div key={interest} className="flex items-center">
              <input
                type="checkbox"
                id={`interest-${interest}`}
                value={interest}
                {...register('interests')}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor={`interest-${interest}`} className="ml-2 block text-sm text-gray-700">
                {interest}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showLocation"
              {...register('settings.privacy.showLocation')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="showLocation" className="ml-2 block text-sm text-gray-700">
              Show my location to matches
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showAge"
              {...register('settings.privacy.showAge')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="showAge" className="ml-2 block text-sm text-gray-700">
              Show my age
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Safety Settings</h3>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="meetupCheckins"
              {...register('settings.safety.meetupCheckins')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="meetupCheckins" className="ml-2 block text-sm text-gray-700">
              Enable meetup check-ins
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="sosAlert"
              {...register('settings.safety.sosAlertEnabled')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="sosAlert" className="ml-2 block text-sm text-gray-700">
              Enable SOS alerts
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="verifiedMatch"
              {...register('settings.safety.requireVerifiedMatch')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="verifiedMatch" className="ml-2 block text-sm text-gray-700">
              Only show verified matches
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyMatches"
              {...register('settings.notifications.matches')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="notifyMatches" className="ml-2 block text-sm text-gray-700">
              New match notifications
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyMessages"
              {...register('settings.notifications.messages')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="notifyMessages" className="ml-2 block text-sm text-gray-700">
              Message notifications
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifySafety"
              {...register('settings.notifications.safetyAlerts')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="notifySafety" className="ml-2 block text-sm text-gray-700">
              Safety alert notifications
            </label>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};
