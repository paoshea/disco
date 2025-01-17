import React from 'react';
import { useForm } from 'react-hook-form';
import { UserSettings } from '@/types/user';
import { userService } from '@/services/api/user.service';

interface MatchSettingsProps {
  initialSettings: UserSettings;
  userId: string;
  onUpdate: (settings: UserSettings) => void;
}

export const MatchSettings: React.FC<MatchSettingsProps> = ({
  initialSettings,
  userId,
  onUpdate,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserSettings>({
    defaultValues: initialSettings,
  });

  const onSubmit = async (data: UserSettings) => {
    try {
      const updatedUser = await userService.updateSettings(userId, data);
      onUpdate(data);
    } catch (error) {
      console.error('Failed to update match settings:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Discovery Settings</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="discoveryRadius" className="block text-sm font-medium text-gray-700">
              Discovery Radius (km)
            </label>
            <input
              type="number"
              id="discoveryRadius"
              {...register('discoveryRadius', {
                required: 'Discovery radius is required',
                min: { value: 1, message: 'Minimum radius is 1km' },
                max: { value: 100, message: 'Maximum radius is 100km' },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.discoveryRadius && (
              <p className="mt-1 text-sm text-red-600">{errors.discoveryRadius.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age Range</label>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ageMin" className="block text-sm text-gray-500">
                  Minimum Age
                </label>
                <input
                  type="number"
                  id="ageMin"
                  {...register('ageRange.min', {
                    required: 'Minimum age is required',
                    min: { value: 18, message: 'Must be at least 18' },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.ageRange?.min && (
                  <p className="mt-1 text-sm text-red-600">{errors.ageRange.min.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="ageMax" className="block text-sm text-gray-500">
                  Maximum Age
                </label>
                <input
                  type="number"
                  id="ageMax"
                  {...register('ageRange.max', {
                    required: 'Maximum age is required',
                    min: { value: 18, message: 'Must be at least 18' },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.ageRange?.max && (
                  <p className="mt-1 text-sm text-red-600">{errors.ageRange.max.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showLocation"
              {...register('privacy.showLocation')}
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
              {...register('privacy.showAge')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="showAge" className="ml-2 block text-sm text-gray-700">
              Show my age
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showLastActive"
              {...register('privacy.showLastActive')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="showLastActive" className="ml-2 block text-sm text-gray-700">
              Show when I was last active
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
              id="requireVerifiedMatch"
              {...register('safety.requireVerifiedMatch')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="requireVerifiedMatch" className="ml-2 block text-sm text-gray-700">
              Only show verified matches
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="meetupCheckins"
              {...register('safety.meetupCheckins')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="meetupCheckins" className="ml-2 block text-sm text-gray-700">
              Enable meetup check-ins
            </label>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Save Settings
        </button>
      </div>
    </form>
  );
};
