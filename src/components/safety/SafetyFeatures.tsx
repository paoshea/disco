import React, { useState } from 'react';
import { User } from '@/types/user';
import { SafetySettings } from '@/types/safety';

interface SafetyFeaturesProps {
  user: User;
  settings: SafetySettings;
  onUpdateSettings: (settings: Partial<SafetySettings>) => Promise<void>;
  onTriggerSOS: () => Promise<void>;
}

export const SafetyFeatures: React.FC<SafetyFeaturesProps> = ({
  user,
  settings,
  onUpdateSettings,
  onTriggerSOS,
}) => {
  const [loading, setLoading] = useState(false);
  const [showSOSConfirm, setShowSOSConfirm] = useState(false);

  const handleSOSTrigger = async () => {
    try {
      setLoading(true);
      await onTriggerSOS();
      // Show confirmation or success message
    } catch (error) {
      console.error('Failed to trigger SOS:', error);
    } finally {
      setLoading(false);
      setShowSOSConfirm(false);
    }
  };

  const handleSettingChange = async (key: keyof SafetySettings, value: boolean) => {
    try {
      await onUpdateSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update safety setting:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* SOS Button */}
      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-4">Emergency SOS</h3>
        {showSOSConfirm ? (
          <div className="space-y-4">
            <p className="text-sm text-red-600">
              Are you sure you want to trigger an SOS alert? This will:
            </p>
            <ul className="list-disc list-inside text-sm text-red-600 ml-4">
              <li>Notify all your emergency contacts</li>
              <li>Share your current location with emergency contacts</li>
              <li>Alert nearby DISCO! users</li>
              <li>Contact local emergency services if enabled</li>
            </ul>
            <div className="flex space-x-4">
              <button
                onClick={handleSOSTrigger}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Sending Alert...' : 'Confirm SOS'}
              </button>
              <button
                onClick={() => setShowSOSConfirm(false)}
                disabled={loading}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSOSConfirm(true)}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Trigger SOS Alert
          </button>
        )}
      </div>

      {/* Safety Features */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Features</h3>
        <div className="space-y-4">
          {/* Verification Status */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Account Verification</h4>
              <p className="text-sm text-gray-500">
                {user.verificationStatus === 'verified'
                  ? 'Your account is verified'
                  : 'Verify your account to unlock additional safety features'}
              </p>
            </div>
            {user.verificationStatus !== 'verified' && (
              <button
                onClick={() => {/* Handle verification */}}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Verify Account
              </button>
            )}
          </div>

          {/* Safety Settings */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoShareLocation"
                checked={settings.autoShareLocation}
                onChange={(e) => handleSettingChange('autoShareLocation', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="autoShareLocation" className="ml-3 text-sm text-gray-700">
                Automatically share location during emergencies
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="meetupCheckins"
                checked={settings.meetupCheckins}
                onChange={(e) => handleSettingChange('meetupCheckins', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="meetupCheckins" className="ml-3 text-sm text-gray-700">
                Enable meetup check-ins
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sosAlertEnabled"
                checked={settings.sosAlertEnabled}
                onChange={(e) => handleSettingChange('sosAlertEnabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="sosAlertEnabled" className="ml-3 text-sm text-gray-700">
                Enable SOS alerts
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireVerifiedMatch"
                checked={settings.requireVerifiedMatch}
                onChange={(e) => handleSettingChange('requireVerifiedMatch', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="requireVerifiedMatch" className="ml-3 text-sm text-gray-700">
                Only match with verified users
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
