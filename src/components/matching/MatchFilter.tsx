import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { MatchPreferences } from '@/types/match';
import { matchService } from '@/services/api/match.service';

interface MatchFilterProps {
  initialPreferences: MatchPreferences;
  onUpdate: (preferences: MatchPreferences) => void;
}

export const MatchFilter: React.FC<MatchFilterProps> = ({
  initialPreferences,
  onUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<MatchPreferences>(initialPreferences);

  const handleSave = async () => {
    try {
      await matchService.updatePreferences(preferences);
      onUpdate(preferences);
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
                  Distance Range (km)
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={preferences.maxDistance}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      maxDistance: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 w-full"
                />
                <div className="mt-1 text-sm text-gray-500 text-right">
                  {preferences.maxDistance} km
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Age Range
                </label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500">Min Age</label>
                    <input
                      type="number"
                      min="18"
                      max={preferences.maxAge}
                      value={preferences.minAge}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          minAge: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500">Max Age</label>
                    <input
                      type="number"
                      min={preferences.minAge}
                      value={preferences.maxAge}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          maxAge: parseInt(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Interests
                </label>
                <div className="mt-2 space-y-2">
                  {['Music', 'Sports', 'Art', 'Technology', 'Travel', 'Food', 'Movies', 'Books'].map(
                    (interest: string) => (
                      <div key={interest} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`interest-${interest}`}
                          checked={preferences.interests.includes(interest)}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              interests: e.target.checked
                                ? [...preferences.interests, interest]
                                : preferences.interests.filter((item) => item !== interest),
                            })
                          }
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label
                          htmlFor={`interest-${interest}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          {interest}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Match Requirements
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="verifiedOnly"
                      checked={preferences.verifiedOnly}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          verifiedOnly: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor="verifiedOnly"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Only show verified profiles
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="withPhoto"
                      checked={preferences.withPhoto}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          withPhoto: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor="withPhoto"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Only show profiles with photos
                    </label>
                  </div>
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
                onClick={handleSave}
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
};
