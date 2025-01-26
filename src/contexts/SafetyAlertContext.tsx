'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getSafetyAlerts,
  createSafetyAlert,
} from '@/services/api/safety.service';
import type { SafetyAlert, Prisma } from '@prisma/client';
import type { SafetyAlertNew } from '@/types/safety';

//type JsonObject = Prisma.JsonObject; // Removed unused type

interface SafetyAlertContextType {
  alerts: SafetyAlertNew[];
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
  const [alerts, setAlerts] = useState<SafetyAlertNew[]>([]);
  //const transformAlert = (data: unknown): SafetyAlertNew => { //Removed unused function
  //  const alert = data as Partial<SafetyAlertNew>;
  //  return {
  //    id: String(alert.id ?? ''),
  //    userId: String(alert.userId ?? ''),
  //    type: alert.type ?? 'custom',
  //    status: alert.status ?? 'active',
  //    location: alert.location ?? {
  //      latitude: 0,
  //      longitude: 0,
  //      timestamp: new Date(),
  //    },
  //    createdAt: alert.createdAt ?? new Date().toISOString(),
  //    updatedAt: alert.updatedAt ?? new Date().toISOString(),
  //  };
  //};
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const userId = localStorage.getItem('userId');
        if (userId && typeof window !== 'undefined') {
          const response = await fetch(`/api/safety/alerts?userId=${userId}`);
          const data = await response.json();
          const safetyAlerts = Array.isArray(data) ? data : [];
          setAlerts(safetyAlerts.map(alert => alert as SafetyAlertNew));
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
    setAlerts(prev => [newAlert as SafetyAlertNew, ...prev]);
  };

  const addAlert = async (alert: Partial<SafetyAlert>) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID is required');
      }

      const locationJson = alert.location as Prisma.JsonObject | null;
      const locationData = {
        latitude: Number(locationJson?.latitude) || 0,
        longitude: Number(locationJson?.longitude) || 0,
        accuracy: Number(locationJson?.accuracy),
        timestamp: new Date().toISOString(),
        privacyMode: 'precise' as const,
        sharingEnabled: true,
        id: alert.id || crypto.randomUUID(),
        userId: alert.userId || userId,
      };

      const locationForPrisma = {
        type: 'Point',
        coordinates: [locationData.latitude, locationData.longitude],
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp,
      };

      const fullAlert = {
        type: alert.type || 'warning',
        priority: alert.priority || 'medium',
        description: alert.description || '',
        message: alert.message || '',
        location: locationForPrisma,
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
      setAlerts(prev => [newAlert as SafetyAlertNew, ...prev]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add alert');
      throw error;
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await fetch(`/api/safety/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss' }),
      });
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
