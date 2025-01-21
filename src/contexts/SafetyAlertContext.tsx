import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useSession } from 'next-auth/react';
import { safetyService } from '@/services/api/safety.service';
import { JsonValue } from '@prisma/client/runtime/library';
import {
  SafetyAlertNew,
  SafetyCheckNew,
  SafetyAlertType,
} from '@/types/safety';
import type { Location } from '@/types/location';

interface SafetyAlertContextType {
  alerts: SafetyAlertNew[];
  safetyChecks: SafetyCheckNew[];
  isLoading: boolean;
  error: string | null;
  addAlert: (alert: Partial<SafetyAlertNew>) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  resolveSafetyCheck: (
    checkId: string,
    status: 'safe' | 'unsafe'
  ) => Promise<void>;
}

interface LocationJson {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

const SafetyAlertContext = createContext<SafetyAlertContextType | null>(null);

export const useSafetyAlerts = () => {
  const context = useContext(SafetyAlertContext);
  if (!context) {
    throw new Error(
      'useSafetyAlerts must be used within a SafetyAlertProvider'
    );
  }
  return context;
};

export const SafetyAlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [alerts, setAlerts] = useState<SafetyAlertNew[]>([]);
  const [safetyChecks, setSafetyChecks] = useState<SafetyCheckNew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertPrismaAlertToNew = useCallback(
    (alert: {
      id: string;
      userId: string;
      type: string;
      priority: string;
      location: JsonValue;
      message: string | null;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
      resolved: boolean;
      dismissed: boolean;
      resolvedAt: Date | null;
    }): SafetyAlertNew => {
      const locationJson = alert.location as LocationJson | null;
      const location: Location = locationJson
        ? {
            id: crypto.randomUUID(),
            userId: alert.userId,
            latitude: locationJson.latitude,
            longitude: locationJson.longitude,
            accuracy: locationJson.accuracy,
            timestamp: new Date(locationJson.timestamp),
            privacyMode: 'precise',
            sharingEnabled: true,
          }
        : {
            id: crypto.randomUUID(),
            userId: alert.userId,
            latitude: 0,
            longitude: 0,
            timestamp: new Date(),
            privacyMode: 'precise',
            sharingEnabled: false,
          };

      return {
        id: alert.id,
        userId: alert.userId,
        type: alert.type as SafetyAlertType,
        status: alert.dismissed
          ? 'dismissed'
          : alert.resolved
            ? 'resolved'
            : 'active',
        location,
        message: alert.message || undefined,
        description: alert.description || undefined,
        evidence: [],
        createdAt: alert.createdAt.toISOString(),
        updatedAt: alert.updatedAt.toISOString(),
        resolvedAt: alert.resolvedAt?.toISOString(),
      };
    },
    []
  );

  const fetchSafetyData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const [alertsData, checksData] = await Promise.all([
        safetyService.getActiveAlerts(user.id),
        safetyService.getSafetyChecks(user.id),
      ]);

      setAlerts(alertsData.map(convertPrismaAlertToNew));
      setSafetyChecks(
        checksData.map(check => {
          const locationJson = check.location as LocationJson | null;
          const location: Location | undefined = locationJson
            ? {
                id: crypto.randomUUID(),
                userId: check.userId,
                latitude: locationJson.latitude,
                longitude: locationJson.longitude,
                accuracy: locationJson.accuracy,
                timestamp: new Date(locationJson.timestamp),
                privacyMode: 'precise',
                sharingEnabled: true,
              }
            : undefined;

          return {
            id: check.id,
            userId: check.userId,
            type: check.type as 'meetup' | 'location' | 'custom',
            description: check.description,
            scheduledFor: check.scheduledFor.toISOString(),
            status: check.status as 'pending' | 'completed' | 'missed',
            location,
            completedAt: check.completedAt?.toISOString(),
            createdAt: check.createdAt.toISOString(),
            updatedAt: check.updatedAt.toISOString(),
          };
        })
      );
    } catch (err) {
      console.error('Error fetching safety data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch safety data'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, convertPrismaAlertToNew]);

  useEffect(() => {
    void fetchSafetyData();
  }, [fetchSafetyData]);

  const addAlert = async (alertData: Partial<SafetyAlertNew>) => {
    if (!user?.id) return;

    try {
      setError(null);
      const newAlert = await safetyService.createSafetyAlert(user.id, {
        type: alertData.type || 'custom',
        description: alertData.description || 'Custom alert',
        severity: 'medium',
        location: alertData.location && {
          latitude: alertData.location.latitude,
          longitude: alertData.location.longitude,
          accuracy: alertData.location.accuracy,
        },
        message: alertData.message,
      });

      // Convert the new alert to match the expected Prisma format with JSON-compatible location
      const prismaAlert = {
        id: newAlert.id,
        userId: newAlert.userId,
        type: newAlert.type,
        priority: 'medium',
        resolved: newAlert.status === 'resolved',
        dismissed: newAlert.status === 'dismissed',
        location: newAlert.location && {
          latitude: newAlert.location.latitude,
          longitude: newAlert.location.longitude,
          accuracy: newAlert.location.accuracy,
          timestamp: newAlert.location.timestamp.toISOString(),
        },
        message: newAlert.message || null,
        description: newAlert.description || null,
        createdAt: new Date(newAlert.createdAt),
        updatedAt: new Date(newAlert.updatedAt),
        resolvedAt: newAlert.resolvedAt ? new Date(newAlert.resolvedAt) : null,
      };

      setAlerts(prev => [...prev, convertPrismaAlertToNew(prismaAlert)]);
    } catch (err) {
      console.error('Error creating alert:', err);
      throw err instanceof Error ? err : new Error('Failed to create alert');
    }
  };

  const dismissAlert = async (alertId: string) => {
    if (!user?.id) return;

    try {
      setError(null);
      await safetyService.dismissAlert(alertId, user.id);
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? {
                ...alert,
                status: 'dismissed' as const,
              }
            : alert
        )
      );
    } catch (err) {
      console.error('Error dismissing alert:', err);
      throw err instanceof Error ? err : new Error('Failed to dismiss alert');
    }
  };

  const resolveAlert = async (alertId: string) => {
    if (!user?.id) return;

    try {
      setError(null);
      await safetyService.resolveAlert(alertId, user.id);
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? {
                ...alert,
                status: 'resolved' as const,
                resolvedAt: new Date().toISOString(),
              }
            : alert
        )
      );
    } catch (err) {
      console.error('Error resolving alert:', err);
      throw err instanceof Error ? err : new Error('Failed to resolve alert');
    }
  };

  const resolveSafetyCheck = async (
    checkId: string,
    status: 'safe' | 'unsafe'
  ) => {
    if (!user?.id) return;

    try {
      setError(null);
      await safetyService.createSafetyCheck(user.id, {
        type: 'location',
        description: `Safety check ${status === 'safe' ? 'completed' : 'missed'}`,
        scheduledFor: new Date().toISOString(),
      });

      setSafetyChecks(prev =>
        prev.map(check =>
          check.id === checkId
            ? {
                ...check,
                status:
                  status === 'safe'
                    ? ('completed' as const)
                    : ('missed' as const),
                completedAt: new Date().toISOString(),
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
  };

  return (
    <SafetyAlertContext.Provider
      value={{
        alerts,
        safetyChecks,
        isLoading,
        error,
        addAlert,
        dismissAlert,
        resolveAlert,
        resolveSafetyCheck,
      }}
    >
      {children}
    </SafetyAlertContext.Provider>
  );
};
