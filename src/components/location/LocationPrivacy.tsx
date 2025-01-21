import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { locationService } from '@/services/location/location.service';
import { toast } from '@/hooks/use-toast';
import type { Location, LocationPrivacyMode } from '@/types/location';
import type { Session } from '@/types/auth';
import React from 'react';

interface LocationState {
  privacyMode: LocationPrivacyMode;
  sharingEnabled: boolean;
}

interface LocationPrivacyProps {
  onPrivacyChange: (mode: LocationPrivacyMode) => void;
  onSharingChange: (enabled: boolean) => void;
}

export default function LocationPrivacy({
  onPrivacyChange,
  onSharingChange,
}: LocationPrivacyProps) {
  const { data: session } = useSession() as { data: Session | null };
  const [locationState, setLocationState] = useState<LocationState>({
    privacyMode: 'precise',
    sharingEnabled: true,
  });

  useEffect(() => {
    const fetchLocationState = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/location');
        if (!response.ok) {
          throw new Error('Failed to fetch location state');
        }

        const data = (await response.json()) as Location;
        if (data) {
          setLocationState({
            privacyMode: data.privacyMode,
            sharingEnabled: data.sharingEnabled,
          });
        }
      } catch (error) {
        console.error('Error fetching location state:', error);
        toast.error(
          'Failed to fetch location settings. Please try again later'
        );
      }
    };

    void fetchLocationState();
  }, [session]);

  const handlePrivacyChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const mode = e.target.value as LocationState['privacyMode'];
    try {
      const response = await fetch('/api/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privacyMode: mode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      setLocationState(prev => ({ ...prev, privacyMode: mode }));
      onPrivacyChange(mode);
      toast.success('Location privacy settings updated successfully');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings. Please try again later');
    }
  };

  const handleSharingChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enabled = e.target.checked;
    try {
      const response = await fetch('/api/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sharingEnabled: enabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update sharing settings');
      }

      setLocationState(prev => ({ ...prev, sharingEnabled: enabled }));
      onSharingChange(enabled);
      toast.success(
        `Location sharing ${enabled ? 'enabled' : 'disabled'} successfully`
      );
    } catch (error) {
      console.error('Error updating sharing settings:', error);
      toast.error('Failed to update sharing settings. Please try again later');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Location Privacy Settings</h2>

      <div className="space-y-4">
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold">Location Privacy</h3>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="privacyMode"
                value="precise"
                checked={locationState.privacyMode === 'precise'}
                onChange={e => void handlePrivacyChange(e)}
                className="form-radio"
              />
              <span>Precise Location</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="privacyMode"
                value="approximate"
                checked={locationState.privacyMode === 'approximate'}
                onChange={e => void handlePrivacyChange(e)}
                className="form-radio"
              />
              <span>Approximate Location</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="privacyMode"
                value="zone"
                checked={locationState.privacyMode === 'zone'}
                onChange={e => void handlePrivacyChange(e)}
                className="form-radio"
              />
              <span>Privacy Zone Only</span>
            </label>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {locationState.privacyMode === 'precise'
              ? 'Share your exact location with others'
              : locationState.privacyMode === 'approximate'
                ? 'Share an approximate area instead of exact location'
                : 'Only share when outside privacy zones'}
          </p>
        </div>

        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={locationState.sharingEnabled}
              onChange={e => void handleSharingChange(e)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              Enable Location Sharing
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500 ml-7">
            Allow others to see your location based on privacy mode
          </p>
        </div>
      </div>
    </div>
  );
}
