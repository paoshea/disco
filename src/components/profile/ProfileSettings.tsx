import React, { useState } from 'react';
import { User, UserSettings } from '@/types/user';

interface ProfileSettingsProps {
  user: User;
  settings: UserSettings;
  onSave: (settings: UserSettings) => Promise<void>;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  settings,
  onSave,
}) => {
  const [editedSettings, setEditedSettings] = useState(settings);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(editedSettings);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Discovery Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Discovery Radius (km)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={editedSettings.discoveryRadius}
                onChange={(e) =>
                  setEditedSettings({
                    ...editedSettings,
                    discoveryRadius: parseInt(e.target.value),
                  })
                }
                className="mt-1 block w-full"
              />
              <span className="text-sm text-gray-500">{editedSettings.discoveryRadius} km</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age Range</label>
              <div className="flex gap-4 mt-1">
                <div>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={editedSettings.ageRange.min}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        ageRange: {
                          ...editedSettings.ageRange,
                          min: parseInt(e.target.value),
                        },
                      })
                    }
                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <span className="text-sm text-gray-500">Min</span>
                </div>
                <div>
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={editedSettings.ageRange.max}
                    onChange={(e) =>
                      setEditedSettings({
                        ...editedSettings,
                        ageRange: {
                          ...editedSettings.ageRange,
                          max: parseInt(e.target.value),
                        },
                      })
                    }
                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  <span className="text-sm text-gray-500">Max</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            {Object.entries(editedSettings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={`notification-${key}`}
                  checked={value}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      notifications: {
                        ...editedSettings.notifications,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`notification-${key}`}
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)} notifications
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy</h3>
          <div className="space-y-4">
            {Object.entries(editedSettings.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <input
                  type="checkbox"
                  id={`privacy-${key}`}
                  checked={value}
                  onChange={(e) =>
                    setEditedSettings({
                      ...editedSettings,
                      privacy: {
                        ...editedSettings.privacy,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`privacy-${key}`}
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  Show {key.split(/(?=[A-Z])/).join(' ').toLowerCase()}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
