import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { safetyService } from '@/services/api/safety.service';
import { EmergencyAlert, SafetyCheck } from '@/types/safety';

interface SafetyContextType {
  alerts: EmergencyAlert[];
  safetyChecks: SafetyCheck[];
  isLoading: boolean;
  error: string | null;
  triggerEmergencyAlert: (location?: GeolocationCoordinates) => Promise<void>;
  resolveSafetyCheck: (checkId: string, status: 'safe' | 'unsafe', notes?: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
}

interface SafetyAlertProviderProps {
  children: React.ReactNode;
  pollingInterval?: number;
}

const SafetyAlertContext = createContext<SafetyContextType | null>(null);

export const useSafetyAlert = () => {
  const context = useContext(SafetyAlertContext);
  if (!context) {
    throw new Error('useSafetyAlert must be used within a SafetyAlertProvider');
  }
  return context;
};

export const SafetyAlertProvider: React.FC<SafetyAlertProviderProps> = ({
  children,
  pollingInterval = 30000, // Default to 30 seconds
}) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSafetyData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const [alertsData, checksData] = await Promise.all([
        safetyService.getEmergencyAlerts(user.id),
        safetyService.getSafetyChecks(user.id),
      ]);

      setAlerts(alertsData);
      setSafetyChecks(checksData);
    } catch (err) {
      console.error('Error fetching safety data:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while fetching safety data. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void fetchSafetyData();

    const interval = setInterval(() => {
      void fetchSafetyData();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchSafetyData, pollingInterval]);

  const triggerEmergencyAlert = useCallback(
    async (location?: GeolocationCoordinates) => {
      if (!user?.id) return;

      try {
        setError(null);
        const alert = await safetyService.triggerEmergencyAlert(user.id, {
          type: 'sos',
          location: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
              }
            : undefined,
          status: 'pending',
          contactedEmergencyServices: false,
          notifiedContacts: [],
        });

        setAlerts(prev => [alert, ...prev]);
      } catch (err) {
        console.error('Error triggering emergency alert:', err);
        throw err instanceof Error
          ? err
          : new Error('An error occurred while triggering the emergency alert. Please try again.');
      }
    },
    [user?.id]
  );

  const resolveSafetyCheck = useCallback(
    async (checkId: string, status: 'safe' | 'unsafe', notes?: string) => {
      if (!user?.id) return;

      try {
        setError(null);
        const updatedCheck = await safetyService.resolveSafetyCheck(user.id, checkId, {
          status,
          notes,
        });

        setSafetyChecks(prev => prev.map(check => (check.id === checkId ? updatedCheck : check)));
      } catch (err) {
        console.error('Error resolving safety check:', err);
        throw err instanceof Error
          ? err
          : new Error('An error occurred while resolving the safety check. Please try again.');
      }
    },
    [user?.id]
  );

  const dismissAlert = useCallback(
    async (alertId: string) => {
      if (!user?.id) return;

      try {
        setError(null);
        await safetyService.dismissEmergencyAlert(user.id, alertId);
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      } catch (err) {
        console.error('Error dismissing alert:', err);
        throw err instanceof Error
          ? err
          : new Error('An error occurred while dismissing the alert. Please try again.');
      }
    },
    [user?.id]
  );

  const handleTriggerEmergencyAlert = async (location?: GeolocationCoordinates) => {
    try {
      await triggerEmergencyAlert(location);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while triggering the emergency alert. Please try again.'
      );
    }
  };

  const handleResolveSafetyCheck = async (checkId: string, status: 'safe' | 'unsafe', notes?: string) => {
    try {
      await resolveSafetyCheck(checkId, status, notes);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while resolving the safety check. Please try again.'
      );
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await dismissAlert(alertId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while dismissing the alert. Please try again.'
      );
    }
  };

  const value = {
    alerts,
    safetyChecks,
    isLoading,
    error,
    triggerEmergencyAlert: handleTriggerEmergencyAlert,
    resolveSafetyCheck: handleResolveSafetyCheck,
    dismissAlert: handleDismissAlert,
  };

  return <SafetyAlertContext.Provider value={value}>{children}</SafetyAlertContext.Provider>;
};
