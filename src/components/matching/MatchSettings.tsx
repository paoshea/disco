import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '@/hooks/useUser';
import { UserPreferences } from '@/types/user';
import { MatchPreferences } from '@/types/match';
import { MatchService } from '@/services/match/match.service';
import { useToast } from '@/hooks/use-toast';
import { AppLocationPrivacyMode } from '@/types/location';

interface MatchSettingsProps {
  userId: string;
  initialSettings?: MatchPreferences;
  onUpdate: (settings: MatchPreferences) => void;
}

type MatchSettingsFormData = MatchPreferences;

const DEFAULT_PREFERENCES: MatchPreferences = {
  maxDistance: 50,
  ageRange: { min: 18, max: 100 },
  activityTypes: [],
  gender: [],
  lookingFor: [],
  relationshipType: [],
  availability: [],
  verifiedOnly: false,
  withPhoto: true,
  privacyMode: AppLocationPrivacyMode.PUBLIC,
  timeWindow: 'anytime',
  useBluetoothProximity: false,
};

export function MatchSettings({
  userId,
  initialSettings = DEFAULT_PREFERENCES,
  onUpdate,
}: MatchSettingsProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const matchService = MatchService.getInstance();

  const { register, handleSubmit, formState: { errors } } = useForm<MatchSettingsFormData>({
    defaultValues: initialSettings,
  });

  const onSubmit = async (data: MatchSettingsFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedPreferences = {
        ...DEFAULT_PREFERENCES,
        ...data,
      };

      await matchService.updatePreferences(user.id, updatedPreferences);
      onUpdate(updatedPreferences);
      toast({
        title: 'Success',
        description: 'Match preferences updated successfully.',
      });
    } catch (error) {
      const errorMessage = 'Failed to update settings. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'error',
      });
      console.error('Failed to update match settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium">Discovery Settings</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="maxDistance"
              className="block text-sm font-medium"
            >
              Discovery Radius (km)
            </label>
            <input
              type="number"
              id="maxDistance"
              {...register('maxDistance', { 
                min: { value: 1, message: 'Must be at least 1km' },
                max: { value: 500, message: 'Must be less than 500km' },
              })}
              className="mt-1 block w-full rounded-md border-input"
              disabled={isSubmitting}
            />
            {errors.maxDistance && (
              <p className="mt-1 text-sm text-destructive">
                {errors.maxDistance.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Age Range</label>
            <div className="mt-1 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ageRange.min" className="sr-only">
                  Minimum Age
                </label>
                <input
                  type="number"
                  id="ageRange.min"
                  {...register('ageRange.min', {
                    min: { value: 18, message: 'Must be at least 18' },
                    max: { value: 100, message: 'Must be less than 100' },
                  })}
                  placeholder="Min Age"
                  className="block w-full rounded-md border-input"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="ageRange.max" className="sr-only">
                  Maximum Age
                </label>
                <input
                  type="number"
                  id="ageRange.max"
                  {...register('ageRange.max', {
                    min: { value: 18, message: 'Must be at least 18' },
                    max: { value: 100, message: 'Must be less than 100' },
                  })}
                  placeholder="Max Age"
                  className="block w-full rounded-md border-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            {(errors.ageRange?.min || errors.ageRange?.max) && (
              <p className="mt-1 text-sm text-destructive">
                {errors.ageRange?.min?.message || errors.ageRange?.max?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Activity Types
            </label>
            <select
              multiple
              {...register('activityTypes')}
              className="mt-1 block w-full rounded-md border-input"
              disabled={isSubmitting}
            >
              <option value="sports">Sports</option>
              <option value="music">Music</option>
              <option value="art">Art</option>
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="gaming">Gaming</option>
              <option value="reading">Reading</option>
              <option value="movies">Movies</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Availability
            </label>
            <select
              multiple
              {...register('availability')}
              className="mt-1 block w-full rounded-md border-input"
              disabled={isSubmitting}
            >
              <option value="weekday_morning">Weekday Mornings</option>
              <option value="weekday_afternoon">Weekday Afternoons</option>
              <option value="weekday_evening">Weekday Evenings</option>
              <option value="weekend_morning">Weekend Mornings</option>
              <option value="weekend_afternoon">Weekend Afternoons</option>
              <option value="weekend_evening">Weekend Evenings</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Time Window
            </label>
            <select
              {...register('timeWindow')}
              className="mt-1 block w-full rounded-md border-input"
              disabled={isSubmitting}
            >
              <option value="anytime">Anytime</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="verifiedOnly"
                {...register('verifiedOnly')}
                className="h-4 w-4 rounded border-input"
                disabled={isSubmitting}
              />
              <label
                htmlFor="verifiedOnly"
                className="ml-2 block text-sm"
              >
                Show verified users only
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="withPhoto"
                {...register('withPhoto')}
                className="h-4 w-4 rounded border-input"
                disabled={isSubmitting}
              />
              <label
                htmlFor="withPhoto"
                className="ml-2 block text-sm"
              >
                Show users with photos only
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="useBluetoothProximity"
                {...register('useBluetoothProximity')}
                className="h-4 w-4 rounded border-input"
                disabled={isSubmitting}
              />
              <label
                htmlFor="useBluetoothProximity"
                className="ml-2 block text-sm"
              >
                Use Bluetooth for nearby matches
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
