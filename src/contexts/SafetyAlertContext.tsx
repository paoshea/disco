import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch safety data';
      setError(errorMessage);
      console.error('Error fetching safety data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSafetyData();

    const intervalId = setInterval(fetchSafetyData, pollingInterval);

    return () => clearInterval(intervalId);
  }, [fetchSafetyData, pollingInterval]);

  const triggerEmergencyAlert = async (location?: GeolocationCoordinates) => {
    if (!user?.id) {
      throw new Error('User must be logged in to trigger alert');
    }

    setIsLoading(true);
    setError(null);

    try {
      const alert = await safetyService.createEmergencyAlert(user.id, {
        type: 'sos',
        location: location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
            }
          : undefined,
      });

      setAlerts(prev => [...prev, alert]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger emergency alert';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveSafetyCheck = async (checkId: string, status: 'safe' | 'unsafe', notes?: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in to resolve safety check');
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedCheck = await safetyService.updateSafetyCheck(user.id, checkId, {
        response: status,
        notes,
        status: 'resolved',
      });

      setSafetyChecks(prev =>
        prev.map(check => (check.id === checkId ? updatedCheck : check))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve safety check';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    if (!user?.id) {
      throw new Error('User must be logged in to dismiss alert');
    }

    setIsLoading(true);
    setError(null);

    try {
      await safetyService.dismissEmergencyAlert(user.id, alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss alert';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafetyAlertContext.Provider
      value={{
        alerts,
        safetyChecks,
        isLoading,
        error,
        triggerEmergencyAlert,
        resolveSafetyCheck,
        dismissAlert,
      }}
    >
      {children}
    </SafetyAlertContext.Provider>
  );
};
