import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import type { MatchPreferences } from '@/types/match';
import { matchService } from '@/services/api/match.service';

interface MatchFilterProps {
  initialPreferences: MatchPreferences;
  onFilterChange: (preferences: MatchPreferences) => void;
}

export function MatchFilter({
  initialPreferences,
  onFilterChange,
}: MatchFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<MatchPreferences>(initialPreferences);

  const handleChange = (
    field: keyof MatchPreferences,
    value: any
  ) => {
    const updatedPreferences = {
      ...preferences,
      [field]: value,
    };
    setPreferences(updatedPreferences);
    onFilterChange(updatedPreferences);
  };

  const handleAgeRangeChange = (
    field: 'min' | 'max',
    value: string
  ) => {
    const updatedPreferences = {
      ...preferences,
      ageRange: {
        ...preferences.ageRange,
        [field]: parseInt(value),
      },
    };
    setPreferences(updatedPreferences);
    onFilterChange(updatedPreferences);
  };

  const handleSave = async () => {
    try {
      await matchService.updatePreferences(preferences);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <AdjustmentsHorizontalIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
        Filters
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-black opacity-30" />
          </div>

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Match Preferences
            </Dialog.Title>

            <div className="mt-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Distance (miles)
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={preferences.maxDistance}
                  onChange={(e) => handleChange('maxDistance', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 text-right">
                  {preferences.maxDistance} miles
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Age Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">Min</label>
                    <input
                      type="number"
                      min="18"
                      max={preferences.ageRange.max}
                      value={preferences.ageRange.min}
                      onChange={(e) => handleAgeRangeChange('min', e.target.value)}
                      className="w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Max</label>
                    <input
                      type="number"
                      min={preferences.ageRange.min}
                      max="100"
                      value={preferences.ageRange.max}
                      onChange={(e) => handleAgeRangeChange('max', e.target.value)}
                      className="w-full rounded-md border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time Window
                </label>
                <select
                  value={preferences.timeWindow}
                  onChange={(e) => handleChange('timeWindow', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300"
                >
                  <option value="anytime">Anytime</option>
                  <option value="now">Right Now</option>
                  <option value="15min">Next 15 Minutes</option>
                  <option value="30min">Next 30 Minutes</option>
                  <option value="1hour">Next Hour</option>
                  <option value="today">Today</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.verifiedOnly}
                    onChange={(e) => handleChange('verifiedOnly', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Verified Users Only
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.withPhoto}
                    onChange={(e) => handleChange('withPhoto', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Users with Photos Only
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  void handleSave();
                }}
                className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
