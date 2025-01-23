import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { MatchPreferences } from '@/types/match';
import { AppLocationPrivacyMode } from '@/types/location';

const matchPreferencesSchema = z.object({
  maxDistance: z.number().min(1).max(100),
  ageRange: z.object({
    min: z.number().min(18).max(100),
    max: z.number().min(18).max(100),
  }),
  interests: z.array(z.string()),
  gender: z.array(z.string()),
  lookingFor: z.array(z.string()),
  relationshipType: z.array(z.string()),
  activityTypes: z.array(z.string()),
  availability: z.array(z.string()),
  verifiedOnly: z.boolean(),
  withPhoto: z.boolean(),
  privacyMode: z.enum(['standard', 'strict']),
  timeWindow: z.enum(['anytime', 'now', '15min', '30min', '1hour', 'today']),
  useBluetoothProximity: z.boolean(),
});

export function MatchPreferencesPanel({
  initialPreferences,
  onSubmit,
}: {
  initialPreferences?: MatchPreferences;
  onSubmit: (preferences: MatchPreferences) => void;
}) {
  const defaultValues: MatchPreferences = {
    maxDistance: 50,
    ageRange: {
      min: 18,
      max: 99,
    },
    gender: [],
    lookingFor: [],
    relationshipType: [],
    activityTypes: [],
    availability: [],
    verifiedOnly: false,
    withPhoto: true,
    privacyMode: AppLocationPrivacyMode.PUBLIC,
    timeWindow: 'anytime',
    useBluetoothProximity: false,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MatchPreferences>({
    resolver: zodResolver(matchPreferencesSchema),
    defaultValues: initialPreferences || defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Match Preferences</h3>
        <p className="text-sm text-gray-500">
          Configure your matching preferences to find better matches
        </p>
      </div>

      <div className="space-y-4">
        {/* Distance Preference */}
        <div>
          <label className="block text-sm font-medium">
            Maximum Distance (miles)
          </label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            {...register('maxDistance', { valueAsNumber: true })}
          />
          {errors.maxDistance && (
            <p className="mt-1 text-sm text-red-600">
              {errors.maxDistance.message}
            </p>
          )}
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium">Age Range</label>
          <div className="mt-1 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500">Minimum</label>
              <input
                type="number"
                className="block w-full rounded-md border-gray-300 shadow-sm"
                {...register('ageRange.min', { valueAsNumber: true })}
              />
              {errors.ageRange?.min && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.ageRange.min.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500">Maximum</label>
              <input
                type="number"
                className="block w-full rounded-md border-gray-300 shadow-sm"
                {...register('ageRange.max', { valueAsNumber: true })}
              />
              {errors.ageRange?.max && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.ageRange.max.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verification and Photo Preferences */}
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              {...register('verifiedOnly')}
            />
            <label className="ml-2 text-sm">Only show verified users</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              {...register('withPhoto')}
            />
            <label className="ml-2 text-sm">Only show users with photos</label>
          </div>
        </div>

        {/* Privacy Mode */}
        <div>
          <label className="block text-sm font-medium">Privacy Mode</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            {...register('privacyMode')}
          >
            <option value="standard">Standard</option>
            <option value="strict">Strict</option>
          </select>
        </div>

        {/* Time Window */}
        <div>
          <label className="block text-sm font-medium">Time Window</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            {...register('timeWindow')}
          >
            <option value="anytime">Anytime</option>
            <option value="now">Right Now</option>
            <option value="15min">Next 15 Minutes</option>
            <option value="30min">Next 30 Minutes</option>
            <option value="1hour">Next Hour</option>
            <option value="today">Today</option>
          </select>
        </div>

        {/* Bluetooth Proximity */}
        <div className="flex items-center">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            {...register('useBluetoothProximity')}
          />
          <label className="ml-2 text-sm">
            Use Bluetooth for proximity matching
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Save Preferences
        </button>
      </div>
    </form>
  );
}
