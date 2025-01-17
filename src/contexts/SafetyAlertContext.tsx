import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { safetyService } from '@/services/api/safety.service';
import type { SafetyAlertNew, SafetyCheckNew, SafetyAlert } from '@/types/safety';
import { Location } from '@/types/location';

interface SafetyContextType {
  alerts: SafetyAlertNew[];
  safetyChecks: SafetyCheckNew[];
  isLoading: boolean;
  error: string | null;
  triggerEmergencyAlert: (location?: Location) => Promise<void>;
  resolveSafetyCheck: (checkId: string, status: 'safe' | 'unsafe', notes?: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  addAlert: (alertData: Partial<SafetyAlertNew>) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
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
  const [alerts, setAlerts] = useState<SafetyAlertNew[]>([]);
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheckNew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertToSafetyAlertNew = (alert: SafetyAlert): SafetyAlertNew => {
    // Default location if not provided
    const defaultLocation: Location = {
      latitude: 0,
      longitude: 0,
      accuracy: 0,
    };

    return {
      ...alert,
      type:
        alert.type === 'check-in' || alert.type === 'location-share'
          ? 'location'
          : alert.type === 'sos'
            ? 'sos'
            : 'custom',
      status: alert.status === 'pending' ? 'active' : alert.status,
      location: alert.location || defaultLocation,
      description: alert.message,
      evidence: [],
    };
  };

  const fetchSafetyData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const [alertsData, checksData] = await Promise.all([
        safetyService.getEmergencyAlerts(user.id),
        safetyService.getSafetyChecks(user.id),
      ]);

      setAlerts(alertsData.map(convertToSafetyAlertNew));
      setSafetyChecks(
        checksData.map(check => ({
          ...check,
          type: 'location',
          scheduledFor: check.scheduledTime,
          status:
            check.status === 'safe'
              ? 'completed'
              : check.status === 'unsafe'
                ? 'missed'
                : 'pending',
          description: check.notes,
        }))
      );
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
    async (location?: Location) => {
      if (!user?.id) return;

      try {
        setError(null);
        const alert = await safetyService.triggerEmergencyAlert(user.id, {
          type: 'sos',
          message: 'Emergency alert triggered',
          location,
        });

        setAlerts(prev => [convertToSafetyAlertNew(alert), ...prev]);
      } catch (err) {
        console.error('Error triggering emergency alert:', err);
        throw err instanceof Error ? err : new Error('Failed to trigger emergency alert');
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
        setSafetyChecks(prev =>
          prev.map(check =>
            check.id === checkId
              ? {
                  ...updatedCheck,
                  type: 'location',
                  scheduledFor: updatedCheck.scheduledTime,
                  status:
                    updatedCheck.status === 'safe'
                      ? 'completed'
                      : updatedCheck.status === 'unsafe'
                        ? 'missed'
                        : 'pending',
                  description: updatedCheck.notes,
                }
              : check
          )
        );
      } catch (err) {
        console.error('Error resolving safety check:', err);
        throw err instanceof Error ? err : new Error('Failed to resolve safety check');
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
        throw err instanceof Error ? err : new Error('Failed to dismiss alert');
      }
    },
    [user?.id]
  );

  const addAlert = useCallback(
    async (alertData: Partial<SafetyAlertNew>) => {
      if (!user?.id) return;

      try {
        setError(null);
        const newAlert = await safetyService.createAlert({
          type: alertData.type || 'sos',
          description: alertData.description,
          location: alertData.location,
        });

        setAlerts(prev => [convertToSafetyAlertNew(newAlert), ...prev]);
      } catch (err) {
        console.error('Error adding alert:', err);
        throw err instanceof Error ? err : new Error('Failed to add alert');
      }
    },
    [user?.id]
  );

  const resolveAlert = useCallback(
    async (alertId: string) => {
      if (!user?.id) return;

      try {
        setError(null);
        const updatedAlert = await safetyService.resolveAlert(alertId);
        setAlerts(prev =>
          prev.map(alert => (alert.id === alertId ? convertToSafetyAlertNew(updatedAlert) : alert))
        );
      } catch (err) {
        console.error('Error resolving alert:', err);
        throw err instanceof Error ? err : new Error('Failed to resolve alert');
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
    addAlert,
    resolveAlert,
  };

  return <SafetyAlertContext.Provider value={value}>{children}</SafetyAlertContext.Provider>;
};
