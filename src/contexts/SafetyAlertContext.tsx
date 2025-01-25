'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getSafetyAlerts,
  createSafetyAlert,
} from '@/services/api/safety.service';
// Add any other required imports
import type { SafetyAlert } from '@prisma/client';

interface SafetyAlertContextType {
  alerts: SafetyAlert[];
  loading: boolean;
  createAlert: (data: Omit<SafetyAlert, 'id' | 'createdAt'>) => Promise<void>;
}

const SafetyAlertContext = createContext<SafetyAlertContextType | null>(null);

export function SafetyAlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const data = await getSafetyAlerts(userId);
          // Type assertion since we know the structure from our API
          setAlerts(data as SafetyAlert[]);
        }
      } catch (error) {
        console.error('Failed to load safety alerts:', error instanceof Error ? error.message : 'Unknown error');
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

  return (
    <SafetyAlertContext.Provider value={{ alerts, loading, createAlert }}>
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