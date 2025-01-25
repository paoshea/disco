'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getSafetyAlerts,
  createSafetyAlert,
} from '@/services/api/safety.service';
// Add any other required imports
import type { SafetyAlert, Prisma } from '@prisma/client';
import type { Location } from '@/types/location';

type JsonObject = Prisma.JsonObject;

interface SafetyAlertContextType {
  alerts: SafetyAlert[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  createAlert: (data: Omit<SafetyAlert, 'id' | 'createdAt'>) => Promise<void>;
  addAlert: (alert: Partial<SafetyAlert>) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
}

const SafetyAlertContext = createContext<SafetyAlertContextType | null>(null);

export function SafetyAlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const response = await getSafetyAlerts(userId);
          const safetyAlerts = Array.isArray(response) ? response : [];
          setAlerts(safetyAlerts as SafetyAlert[]);
        }
      } catch (error) {
        console.error(
          'Failed to load safety alerts:',
          error instanceof Error ? error.message : 'Unknown error'
        );
      } finally {
        setLoading(false);
      }
    }
    void loadAlerts();
  }, []);

  const createAlert = async (data: Omit<SafetyAlert, 'id' | 'createdAt'>) => {
    const newAlert = await createSafetyAlert(data);
    setAlerts(prev => [newAlert, ...prev]);
  };

  const addAlert = async (alert: Partial<SafetyAlert>) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID is required');
      }

      const locationJson = alert.location as JsonObject | null;
      const locationData = {
        latitude: Number(locationJson?.latitude) || 0,
        longitude: Number(locationJson?.longitude) || 0,
        accuracy: Number(locationJson?.accuracy),
        timestamp: new Date(),
        privacyMode: 'precise' as const,
        sharingEnabled: true,
        id: alert.id || crypto.randomUUID(),
        userId: alert.userId || userId // Fallback to current userId if not provided
      } satisfies Location;

      const fullAlert = {
        type: alert.type || 'warning',
        priority: alert.priority || 'medium',
        description: alert.description || '',
        message: alert.message || '',
        location: locationData,
        status: 'active' as const,
        dismissed: false,
        dismissedAt: null,
        resolved: false,
        resolvedAt: null,
        updatedAt: new Date(),
        userId,
        ...alert,
      };

      const newAlert = await createSafetyAlert(fullAlert);
      setAlerts(prev => [newAlert, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add alert');
      throw err;
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      // Implement API call if needed
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss alert');
      throw err;
    }
  };

  return (
    <SafetyAlertContext.Provider
      value={{
        alerts,
        loading,
        isLoading: loading,
        error,
        createAlert,
        addAlert,
        dismissAlert,
      }}
    >
      {children}
    </SafetyAlertContext.Provider>
  );
}

export function useSafetyAlerts() {
  const context = useContext(SafetyAlertContext);
  if (!context) {
    throw new Error(
      'useSafetyAlerts must be used within a SafetyAlertProvider'
    );
  }
  return context;
}