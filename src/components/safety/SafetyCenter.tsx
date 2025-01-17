import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { safetyService } from '@/services/api/safety.service';
import { SafetySettings } from '@/types/safety';
import { EmergencyContact } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SafetyCenterProps {
  onTriggerAlert: (location?: GeolocationCoordinates) => Promise<void>;
  onDismissAlert: (alertId: string) => Promise<void>;
}

export const SafetyCenter: React.FC<SafetyCenterProps> = ({ 
  onTriggerAlert,
  onDismissAlert 
}) => {
  const { user, isLoading } = useAuth();
  const [settings, setSettings] = useState<SafetySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        const userSettings = await safetyService.getSettings(user.id);
        setSettings(userSettings);
        setError(null);
      } catch (err) {
        setError('Failed to load safety settings');
        console.error('Error loading safety settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.id]);

  const handleUpdateSettings = async (newSettings: Partial<SafetySettings>) => {
    if (!user?.id || !settings) return;

    try {
      const updatedSettings = await safetyService.updateSettings(user.id, newSettings);
      setSettings(updatedSettings);
      setError(null);
    } catch (err) {
      setError('Failed to update safety settings');
      console.error('Error updating safety settings:', err);
    }
  };

  const handleTriggerSOS = async () => {
    if (!user?.id) return;

    try {
      await onTriggerAlert();
      setError(null);
    } catch (err) {
      setError('Failed to trigger SOS alert');
      console.error('Error triggering SOS alert:', err);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Alert
        type="warning"
        title="Authentication Required"
        message="Please log in to access safety features."
      />
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error"
        message={error}
        onClose={() => setError(null)}
      />
    );
  }

  if (!settings) {
    return (
      <Alert
        type="error"
        title="Settings Unavailable"
        message="Unable to load safety settings. Please try again later."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Features</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">SOS Alert</h4>
              <p className="text-sm text-gray-500">
                Trigger an emergency alert to notify your emergency contacts
              </p>
            </div>
            <Button
              onClick={handleTriggerSOS}
              variant="danger"
              className="ml-4"
            >
              Trigger SOS
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Location Sharing</h4>
              <p className="text-sm text-gray-500">
                Share your location with emergency contacts during alerts
              </p>
            </div>
            <Button
              onClick={() => handleUpdateSettings({ locationSharing: !settings.locationSharing })}
              variant={settings.locationSharing ? "primary" : "secondary"}
            >
              {settings.locationSharing ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
