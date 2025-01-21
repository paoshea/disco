import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { safetyService } from '@/services/api/safety.service';
import type {
  SafetyAlertNew,
  SafetyCheckNew,
  SafetyAlert,
  SafetyAlertType,
} from '@/types/safety';
import { Location } from '@/types/location';
import { Prisma } from '@prisma/client';

type JsonValue = Prisma.JsonValue;

interface SafetyContextType {
  alerts: SafetyAlertNew[];
  safetyChecks: SafetyCheckNew[];
  isLoading: boolean;
  error: string | null;
  triggerEmergencyAlert: (location?: Location) => Promise<void>;
  resolveSafetyCheck: (
    checkId: string,
    status: 'safe' | 'unsafe',
    notes?: string
  ) => Promise<void>;
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

  const convertToSafetyAlertNew = (alert: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    type: string;
    priority: string;
    message: string | null;
    description: string | null;
    location: JsonValue;
    dismissed: boolean;
    dismissedAt: Date | null;
    resolved: boolean;
    resolvedAt: Date | null;
  }): SafetyAlertNew => {
    // Create full Location object first
    const createLocation = (loc?: Partial<Location>): Location => ({
      id: crypto.randomUUID(),
      userId: alert.userId,
      latitude: loc?.latitude || 0,
      longitude: loc?.longitude || 0,
      accuracy: loc?.accuracy || 0,
      timestamp: loc?.timestamp || new Date(),
      privacyMode: 'precise',
      sharingEnabled: true,
    });

    // Extract only the fields needed for SafetyAlertNew
    const getLocationForAlert = (loc: Location) => ({
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy,
      timestamp: loc.timestamp,
    });

    const defaultLocation = createLocation();
    const alertLocation = alert.location
      ? createLocation(alert.location as any)
      : defaultLocation;

    return {
      id: alert.id,
      userId: alert.userId,
      type: alert.type as SafetyAlertType,
      status: alert.dismissed ? 'dismissed' : alert.resolved ? 'resolved' : 'active',
      location: getLocationForAlert(alertLocation),
      message: alert.message || undefined,
      description: alert.description || undefined,
      evidence: [],
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
    };
  };

  const fetchSafetyData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const [alertsData, checksData] = await Promise.all([
        safetyService.getSafetyAlerts(user.id),
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
        throw err instanceof Error
          ? err
          : new Error('Failed to trigger emergency alert');
      }
    },
    [user?.id]
  );

  const resolveSafetyCheck = useCallback(
    async (checkId: string, status: 'safe' | 'unsafe', notes?: string) => {
      if (!user?.id) return;

      try {
        setError(null);
        const updatedCheck = await safetyService.resolveSafetyCheck(
          user.id,
          checkId,
          {
            status,
            notes,
          }
        );
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
        throw err instanceof Error
          ? err
          : new Error('Failed to resolve safety check');
      }
    },
    [user?.id]
  );

  const dismissAlert = useCallback(
    async (alertId: string) => {
      if (!user?.id) return;
      try {
        await safetyService.dismissAlert(alertId, user.id);
        setAlerts(alerts.map(alert =>
          alert.id === alertId ? { ...alert, status: 'dismissed' } : alert
        ));
      } catch (error) {
        setError('Failed to dismiss alert');
        console.error('Failed to dismiss alert:', error);
      }
    },
    [user?.id, alerts]
  );

  const addAlert = useCallback(
    async (alertData: Partial<SafetyAlertNew>) => {
      if (!user?.id) return;

      try {
        setError(null);
        const newAlert = await safetyService.createSafetyAlert(user.id, {
          type: alertData.type || 'custom',
          description: alertData.description || 'Custom alert',
          severity: 'medium',
          location: alertData.location,
          message: alertData.message,
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
        await safetyService.resolveAlert(alertId, user.id);
        setAlerts(alerts.map(alert =>
          alert.id === alertId ? { ...alert, status: 'resolved' } : alert
        ));
      } catch (error) {
        setError('Failed to resolve alert');
        console.error('Failed to resolve alert:', error);
      }
    },
    [user?.id, alerts]
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

  return (
    <SafetyAlertContext.Provider value={value}>
      {children}
    </SafetyAlertContext.Provider>
  );
};
