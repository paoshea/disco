import React, { useState, useEffect } from 'react';
import { SafetyAlert } from '@/types/safety';
import { safetyService } from '@/services/api/safety.service';
import { EmergencyContactForm } from './EmergencyContactForm';
import { SafetyAlertNotification } from './SafetyAlertNotification';
import { SafetyFeatures } from './SafetyFeatures';

interface SafetyCenterProps {
  userId: string;
}

export const SafetyCenter: React.FC<SafetyCenterProps> = ({ userId }) => {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userAlerts = await safetyService.getAlerts(userId);
        setAlerts(userAlerts);
      } catch (err) {
        console.error('Error fetching safety alerts:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while fetching alerts. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchAlerts();
  }, [userId]);

  const handleDismissAlert = async (alertId: string) => {
    try {
      setError(null);
      await safetyService.dismissAlert(alertId);
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId));
    } catch (err) {
      console.error('Error dismissing alert:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while dismissing the alert. Please try again.'
      );
    }
  };

  const handleDismissAlertWrapper = (alertId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    void handleDismissAlert(alertId);
  };

  const handleEmergencyContact = async (data: { name: string; phone: string }) => {
    try {
      setError(null);
      await safetyService.addEmergencyContact(userId, data);
      // Optionally refresh the contacts list here
    } catch (err) {
      console.error('Error adding emergency contact:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while adding the emergency contact. Please try again.'
      );
    }
  };

  const handleEmergencyContactWrapper = (e: React.FormEvent) => {
    e.preventDefault();
    void handleEmergencyContact({ name: '', phone: '' }); // Replace with actual form data
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Safety Center</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {alerts.length > 0 && (
              <div className="mb-8 space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Active Alerts</h2>
                {alerts.map((alert) => (
                  <SafetyAlertNotification
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismissAlertWrapper(alert.id)}
                  />
                ))}
              </div>
            )}

            <SafetyFeatures userId={userId} />

            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contacts</h2>
              <EmergencyContactForm onSubmit={handleEmergencyContactWrapper} onCancel={() => {}} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
