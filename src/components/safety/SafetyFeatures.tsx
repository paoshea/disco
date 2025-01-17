import React, { useState } from 'react';
import { User } from '@/types/user';
import { SafetySettings } from '@/types/safety';
import { Button } from '@/components/ui/Button';
import { safetyService } from '@/services/api/safety.service';
import { useGeolocation } from '@/hooks/useGeolocation';

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
  const { getCurrentPosition } = useGeolocation();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [showSOSConfirm, setShowSOSConfirm] = useState(false);

  const handleSafetyAction = async (action: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, [action]: true }));
      setError(null);

      const location = await getCurrentPosition();
      if (action === 'sos') {
        await onTriggerSOS();
      } else {
        await safetyService.triggerSafetyAction(user.id, action, location);
      }
    } catch (err) {
      console.error(`Error triggering ${action}:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `An error occurred while triggering ${action}. Please try again.`
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  const handleActionWrapper = (action: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    void handleSafetyAction(action);
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
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

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
              <Button
                onClick={handleActionWrapper('sos')}
                disabled={isLoading.sos}
                variant="danger"
                className="mt-4"
                fullWidth
              >
                {isLoading.sos ? 'Sending Alert...' : 'Confirm SOS'}
              </Button>
              <Button
                onClick={() => setShowSOSConfirm(false)}
                disabled={isLoading.sos}
                variant="secondary"
                className="mt-4"
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowSOSConfirm(true)}
            disabled={isLoading.sos}
            variant="danger"
            className="mt-4"
            fullWidth
          >
            Trigger SOS Alert
          </Button>
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
              <Button
                onClick={() => {
                  /* Handle verification */
                }}
                disabled={isLoading.verification}
                variant="primary"
                className="mt-4"
                fullWidth
              >
                Verify Account
              </Button>
            )}
          </div>

          {/* Safety Settings */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoShareLocation"
                checked={settings.autoShareLocation}
                onChange={e => handleSettingChange('autoShareLocation', e.target.checked)}
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
                onChange={e => handleSettingChange('meetupCheckins', e.target.checked)}
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
                onChange={e => handleSettingChange('sosAlertEnabled', e.target.checked)}
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
                onChange={e => handleSettingChange('requireVerifiedMatch', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="requireVerifiedMatch" className="ml-3 text-sm text-gray-700">
                Only match with verified users
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Safety Check</h3>
          <p className="mt-2 text-sm text-gray-500">
            Request a safety check from your emergency contacts.
          </p>
          <Button
            onClick={handleActionWrapper('safety_check')}
            disabled={isLoading.safety_check}
            variant="primary"
            className="mt-4"
            fullWidth
          >
            {isLoading.safety_check ? 'Requesting...' : 'Request Safety Check'}
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Share Location</h3>
          <p className="mt-2 text-sm text-gray-500">
            Share your current location with your emergency contacts.
          </p>
          <Button
            onClick={handleActionWrapper('share_location')}
            disabled={isLoading.share_location}
            variant="secondary"
            className="mt-4"
            fullWidth
          >
            {isLoading.share_location ? 'Sharing...' : 'Share Location'}
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900">Call for Help</h3>
          <p className="mt-2 text-sm text-gray-500">
            Connect with emergency services or your designated emergency contact.
          </p>
          <Button
            onClick={handleActionWrapper('call_help')}
            disabled={isLoading.call_help}
            variant="primary"
            className="mt-4"
            fullWidth
          >
            {isLoading.call_help ? 'Connecting...' : 'Call for Help'}
          </Button>
        </div>
      </div>
    </div>
  );
};
