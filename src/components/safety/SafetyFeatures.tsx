import React, { useState } from 'react';
import type { SafetyFeaturesProps } from '@/types/safety';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { safetyService } from '@/services/api/safety.service';

export const SafetyFeatures: React.FC<SafetyFeaturesProps> = ({ user }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleFeature = async (feature: string, enabled: boolean) => {
    try {
      setIsUpdating(true);
      setError(null);
      await safetyService.updateSafetyFeature(user.id, feature, enabled);
    } catch (err) {
      console.error('Error updating safety feature:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred while updating safety features'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmergencyContactUpdate = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      await safetyService.updateEmergencyContacts(user.id);
    } catch (err) {
      console.error('Error updating emergency contacts:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred while updating emergency contacts'
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
            checked={user.safetySettings.locationSharing}
            onChange={enabled => handleToggleFeature('locationSharing', enabled)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Automatic Check-ins</h3>
            <p className="text-sm text-gray-500">
              Automatically request check-ins during high-risk activities
            </p>
          </div>
          <Switch
            checked={user.safetySettings.automaticCheckins}
            onChange={enabled => handleToggleFeature('automaticCheckins', enabled)}
            disabled={isUpdating}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Emergency Notifications</h3>
            <p className="text-sm text-gray-500">
              Send notifications to emergency contacts during alerts
            </p>
          </div>
          <Switch
            checked={user.safetySettings.emergencyNotifications}
            onChange={enabled => handleToggleFeature('emergencyNotifications', enabled)}
            disabled={isUpdating}
          />
        </div>
      </div>

      <div className="mt-8">
        <Button
          onClick={handleEmergencyContactUpdate}
          disabled={isUpdating}
          variant="secondary"
          className="w-full"
        >
          Update Emergency Contacts
        </Button>
      </div>
    </div>
  );
};
