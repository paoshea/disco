import React, { useState, useCallback } from 'react';
import type { SafetyFeaturesProps, SafetySettingsNew } from '@/types/safety';
import { Switch } from '@/components/ui/Switch';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { safetyService } from '@/services/api/safety.service';

type BooleanFeatureKey = {
  [K in keyof SafetySettingsNew]: SafetySettingsNew[K] extends boolean
    ? K
    : never;
}[keyof SafetySettingsNew];

interface FeatureConfig {
  key: BooleanFeatureKey;
  title: string;
  description: string;
}

const SAFETY_FEATURES: FeatureConfig[] = [
  {
    key: 'autoShareLocation',
    title: 'Location Sharing',
    description: 'Share your location with emergency contacts during alerts',
  },
  {
    key: 'meetupCheckins',
    title: 'Meetup Check-ins',
    description: 'Automatically check in when arriving at meetup locations',
  },
  {
    key: 'sosAlertEnabled',
    title: 'SOS Alert',
    description: 'Enable quick access to emergency SOS alerts',
  },
  {
    key: 'requireVerifiedMatch',
    title: 'Verified Match Required',
    description: 'Only allow meetups with verified users',
  },
];

export const SafetyFeatures: React.FC<SafetyFeaturesProps> = ({
  user,
  settings,
  onSettingsChange,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureStates, setFeatureStates] = useState(settings);

  const handleToggleFeature = useCallback(
    async (feature: BooleanFeatureKey, enabled: boolean) => {
      try {
        setIsUpdating(true);
        setError(null);
        // TODO: Re-enable settings update when implemented
        await safetyService.updateSafetySettings(user.id);
        // Store settings update locally for now
        setFeatureStates(prev => ({
          ...prev,
          [feature]: enabled,
        }));
        onSettingsChange?.({
          ...featureStates,
          [feature]: enabled,
        });
      } catch (err) {
        console.error('Error updating safety feature:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while updating safety features'
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [user.id, onSettingsChange, featureStates]
  );

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <div className="space-y-4">
        {SAFETY_FEATURES.map(feature => (
          <div key={feature.key} className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
            <Switch
              checked={featureStates[feature.key]}
              onChange={enabled =>
                void handleToggleFeature(feature.key, enabled)
              }
              disabled={isUpdating}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
