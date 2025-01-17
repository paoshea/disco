import React, { useState } from 'react';
import type { SafetyFeaturesProps, SafetySettingsNew } from '@/types/safety';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { safetyService } from '@/services/api/safety.service';

export const SafetyFeatures: React.FC<SafetyFeaturesProps> = ({
  user,
  settings,
  onSettingsChange,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleFeature = async (feature: keyof SafetySettingsNew, enabled: boolean) => {
    try {
      setIsUpdating(true);
      setError(null);
      const updatedSettings = await safetyService.updateSafetyFeature(user.id, feature, enabled);
      onSettingsChange(updatedSettings);
    } catch (err) {
      console.error('Error updating safety feature:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred while updating safety features'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Location Sharing</h3>
            <p className="text-sm text-gray-500">
              Share your location with emergency contacts during alerts
            </p>
          </div>
          <Switch
            checked={settings.autoShareLocation}
            onChange={enabled => handleToggleFeature('autoShareLocation', enabled)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Meetup Check-ins</h3>
            <p className="text-sm text-gray-500">
              Automatically check in when arriving at meetup locations
            </p>
          </div>
          <Switch
            checked={settings.meetupCheckins}
            onChange={enabled => handleToggleFeature('meetupCheckins', enabled)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">SOS Alert</h3>
            <p className="text-sm text-gray-500">Enable quick access to emergency SOS alerts</p>
          </div>
          <Switch
            checked={settings.sosAlertEnabled}
            onChange={enabled => handleToggleFeature('sosAlertEnabled', enabled)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Verified Match Required</h3>
            <p className="text-sm text-gray-500">Only allow meetups with verified users</p>
          </div>
          <Switch
            checked={settings.requireVerifiedMatch}
            onChange={enabled => handleToggleFeature('requireVerifiedMatch', enabled)}
            disabled={isUpdating}
          />
        </div>
      </div>
    </div>
  );
};
