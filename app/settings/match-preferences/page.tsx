'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { preferencesService } from '@/services/preferences/preferences.service';
import type { MatchPreferences } from '@/types/matching';

const ACTIVITY_TYPES = [
  'Running',
  'Cycling',
  'Swimming',
  'Hiking',
  'Tennis',
  'Basketball',
  'Soccer',
  'Volleyball',
  'Yoga',
  'Fitness',
  'Other',
];

const EXPERIENCE_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional',
];

const AVAILABILITY = [
  'Weekday Mornings',
  'Weekday Afternoons',
  'Weekday Evenings',
  'Weekend Mornings',
  'Weekend Afternoons',
  'Weekend Evenings',
];

export default function MatchPreferencesPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MatchPreferences>();

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await preferencesService.getMatchPreferences();
        if (prefs) {
          Object.entries(prefs).forEach(([key, value]) => {
            setValue(key as keyof MatchPreferences, value);
          });
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load preferences'
        );
      }
    };

    void loadPreferences();
  }, [setValue]);

  const onSubmit = async (data: MatchPreferences) => {
    try {
      setError(null);
      setSuccess(false);
      const result = await preferencesService.updateMatchPreferences(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update preferences');
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to update preferences'
      );
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Match Preferences</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Preferences updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">Activity Types</h2>
          <div className="grid grid-cols-2 gap-4">
            {ACTIVITY_TYPES.map(activity => (
              <div key={activity} className="flex items-center">
                <input
                  type="checkbox"
                  value={activity}
                  {...register('activityTypes')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">{activity}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Distance & Age</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Distance (km)
              </label>
              <input
                type="number"
                {...register('maxDistance', {
                  required: 'Maximum distance is required',
                  min: { value: 1, message: 'Distance must be at least 1km' },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.maxDistance && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.maxDistance.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  {...register('ageRange.0', {
                    required: 'Min age is required',
                    min: { value: 18, message: 'Must be at least 18' },
                  })}
                  placeholder="Min"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                <input
                  type="number"
                  {...register('ageRange.1', {
                    required: 'Max age is required',
                    min: { value: 18, message: 'Must be at least 18' },
                  })}
                  placeholder="Max"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              {(errors.ageRange?.[0] || errors.ageRange?.[1]) && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid age range
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Experience Level</h2>
          <select
            {...register('experienceLevel', {
              required: 'Experience level is required',
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select level</option>
            {EXPERIENCE_LEVELS.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          {errors.experienceLevel && (
            <p className="mt-1 text-sm text-red-600">
              {errors.experienceLevel.message}
            </p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Availability</h2>
          <div className="grid grid-cols-2 gap-4">
            {AVAILABILITY.map(time => (
              <div key={time} className="flex items-center">
                <input
                  type="checkbox"
                  value={time}
                  {...register('availability')}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">{time}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
