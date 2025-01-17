import React, { useState } from 'react';
import { User, EmergencyContact } from '@/types/user';

interface SafetyFeaturesProps {
  user: User;
  onUpdateEmergencyContacts: (contacts: EmergencyContact[]) => Promise<void>;
  onUpdateSafetySettings: (settings: any) => Promise<void>;
  onTriggerSOS: () => Promise<void>;
}

export const SafetyFeatures: React.FC<SafetyFeaturesProps> = ({
  user,
  onUpdateEmergencyContacts,
  onUpdateSafetySettings,
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
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {loading ? 'Sending Alert...' : 'Confirm SOS'}
              </button>
              <button
                onClick={() => setShowSOSConfirm(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSOSConfirm(true)}
            className="inline-flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Trigger SOS Alert
          </button>
        )}
      </div>

      {/* Safety Checklist */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Checklist</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Phone Number Verified</p>
              <p className="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            {user.verificationStatus.phone ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Verified
              </span>
            ) : (
              <button className="text-sm text-primary-600 hover:text-primary-500">
                Verify Now
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Identity Verification</p>
              <p className="text-sm text-gray-500">Verify your identity with a government ID</p>
            </div>
            {user.verificationStatus.identity ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Verified
              </span>
            ) : (
              <button className="text-sm text-primary-600 hover:text-primary-500">
                Verify Now
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Emergency Contacts</p>
              <p className="text-sm text-gray-500">
                {user.emergencyContacts.length} contact(s) added
              </p>
            </div>
            <button className="text-sm text-primary-600 hover:text-primary-500">
              Manage Contacts
            </button>
          </div>
        </div>
      </div>

      {/* Safety Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Safety Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Location Sharing</p>
              <p className="text-sm text-gray-500">Automatically share location during meetups</p>
            </div>
            <button
              type="button"
              className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-primary-600"
              role="switch"
              aria-checked="true"
            >
              <span className="translate-x-5 pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200">
                <span
                  className="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
                  aria-hidden="true"
                ></span>
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Meetup Check-ins</p>
              <p className="text-sm text-gray-500">Require check-ins during meetups</p>
            </div>
            <button
              type="button"
              className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-gray-200"
              role="switch"
              aria-checked="false"
            >
              <span className="translate-x-0 pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200">
                <span
                  className="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity opacity-100"
                  aria-hidden="true"
                ></span>
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Verified Users Only</p>
              <p className="text-sm text-gray-500">Only match with verified users</p>
            </div>
            <button
              type="button"
              className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-primary-600"
              role="switch"
              aria-checked="true"
            >
              <span className="translate-x-5 pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200">
                <span
                  className="absolute inset-0 h-full w-full flex items-center justify-center transition-opacity"
                  aria-hidden="true"
                ></span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
