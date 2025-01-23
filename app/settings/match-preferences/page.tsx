'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { preferencesService } from '@/services/preferences/preferences.service';
import type { MatchPreferences } from '@/types/match';

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

const matchPreferencesSchema = z.object({
  maxDistance: z.number().min(1).max(100),
  ageRange: z.object({
    min: z.number().min(18).max(99),
    max: z.number().min(18).max(99),
  }),
  interests: z.array(z.string()),
  activityTypes: z.array(z.string()),
  availability: z.array(z.string()),
  verifiedOnly: z.boolean(),
  withPhoto: z.boolean(),
});

export default function MatchPreferencesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchPreferences>({
    resolver: zodResolver(matchPreferencesSchema),
    defaultValues: {
      maxDistance: 50,
      ageRange: {
        min: 18,
        max: 99,
      },
      interests: [],
      activityTypes: [],
      availability: [],
      verifiedOnly: false,
      withPhoto: true,
    },
  });

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
  }, []);

  const onSubmit = async (data: MatchPreferences) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const result = await preferencesService.updateMatchPreferences(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update preferences');
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update preferences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Match Preferences</h1>

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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Distance (km)
            </label>
            <input
              type="number"
              {...register('maxDistance', {
                valueAsNumber: true,
                min: 1,
                max: 100,
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.maxDistance && (
              <p className="mt-1 text-sm text-red-600">
                {errors.maxDistance.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Age Range</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs text-gray-500">Minimum</label>
              <input
                type="number"
                {...register('ageRange.min', {
                  valueAsNumber: true,
                  min: 18,
                  max: 99,
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.ageRange?.min && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.ageRange.min.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500">Maximum</label>
              <input
                type="number"
                {...register('ageRange.max', {
                  valueAsNumber: true,
                  min: 18,
                  max: 99,
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.ageRange?.max && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.ageRange.max.message}
                </p>
              )}
            </div>
          </div>
        </div>

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

        <div>
          <label className="block text-sm font-medium">Verified Users Only</label>
          <input
            type="checkbox"
            {...register('verifiedOnly')}
            className="mt-1 rounded border-gray-300 text-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">With Photo Only</label>
          <input
            type="checkbox"
            {...register('withPhoto')}
            className="mt-1 rounded border-gray-300 text-indigo-600"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
}
