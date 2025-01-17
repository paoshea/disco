import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
      const [alertsData, checksData] = await Promise.all([
        safetyService.getEmergencyAlerts(user.id),
        safetyService.getSafetyChecks(user.id),
      ]);

      setAlerts(alertsData);
      setSafetyChecks(checksData);
      setError(null);
    } catch (err) {
      console.error('Error fetching safety data:', err);
      setError('Failed to fetch safety data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSafetyData();
    const interval = setInterval(fetchSafetyData, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchSafetyData, pollingInterval]);

  const triggerEmergencyAlert = useCallback(
    async (location?: GeolocationCoordinates) => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
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

        setAlerts((prev) => [alert, ...prev]);
        setError(null);
      } catch (err) {
        console.error('Error triggering emergency alert:', err);
        setError('Failed to trigger emergency alert');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  const resolveSafetyCheck = useCallback(
    async (checkId: string, status: 'safe' | 'unsafe', notes?: string) => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const updatedCheck = await safetyService.resolveSafetyCheck(user.id, checkId, {
          status,
          notes,
        });

        setSafetyChecks((prev) =>
          prev.map((check) => (check.id === checkId ? updatedCheck : check))
        );
        setError(null);
      } catch (err) {
        console.error('Error resolving safety check:', err);
        setError('Failed to resolve safety check');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  const dismissAlert = useCallback(
    async (alertId: string) => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        await safetyService.dismissEmergencyAlert(user.id, alertId);
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
        setError(null);
      } catch (err) {
        console.error('Error dismissing alert:', err);
        setError('Failed to dismiss alert');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id]
  );

  const value = {
    alerts,
    safetyChecks,
    isLoading,
    error,
    triggerEmergencyAlert,
    resolveSafetyCheck,
    dismissAlert,
  };

  return <SafetyAlertContext.Provider value={value}>{children}</SafetyAlertContext.Provider>;
};
