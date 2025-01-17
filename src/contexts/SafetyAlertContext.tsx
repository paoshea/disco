import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { EmergencyAlert, EmergencyContact as SafetyEmergencyContact } from '@/types/safety';
import { EmergencyContact as UserEmergencyContact } from '@/types/user';
import { safetyService } from '@/services/api/safety.service';
import { toSafetyContact } from '@/utils/contactTypes';

interface SafetyAlertContextType {
  activeAlerts: EmergencyAlert[];
  emergencyContacts: SafetyEmergencyContact[];
  triggerAlert: (alert: Omit<EmergencyAlert, 'id'>) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
}

const SafetyAlertContext = createContext<SafetyAlertContextType | undefined>(undefined);

interface SafetyAlertProviderProps {
  children: React.ReactNode;
}

export const SafetyAlertProvider: React.FC<SafetyAlertProviderProps> = ({ children }) => {
  const ws = useWebSocket();
  const { user } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<SafetyEmergencyContact[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/safety/alerts?userId=${user.id}`
    );

    // Load initial data
    const loadData = async () => {
      try {
        if (!user?.id) return;
        const [alerts, contacts] = await Promise.all([
          safetyService.getActiveAlerts(user.id),
          safetyService.getEmergencyContacts(user.id),
        ]);
        setActiveAlerts(alerts);
        // Convert user contacts to safety contacts
        const safetyContacts = contacts.map(contact => 
          toSafetyContact(contact, user.id)
        );
        setEmergencyContacts(safetyContacts);
      } catch (error) {
        console.error('Error loading safety data:', error);
      }
    };
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (!ws || !user?.id) return;

    // Subscribe to safety-related events
    const handleEmergencyAlert = (alert: EmergencyAlert) => {
      setActiveAlerts(prev => [...prev, alert]);
      
      // Play alert sound
      const audio = new Audio('/sounds/emergency-alert.mp3');
      audio.play().catch(console.error);

      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('Emergency Alert', {
          body: alert.message || 'Emergency alert triggered',
          icon: '/icons/emergency.png',
        });
      }
    };

    const handleAlertResolution = (alertId: string) => {
      setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    const handleContactUpdate = (contact: UserEmergencyContact) => {
      // Convert user contact to safety contact
      const safetyContact = toSafetyContact(contact, user.id);
      setEmergencyContacts(prev => 
        prev.map(c => c.id === safetyContact.id ? safetyContact : c)
      );
    };

    ws.on('emergency_alert', handleEmergencyAlert);
    ws.on('alert_resolved', handleAlertResolution);
    ws.on('contact_updated', handleContactUpdate);

    return () => {
      ws.off('emergency_alert', handleEmergencyAlert);
      ws.off('alert_resolved', handleAlertResolution);
      ws.off('contact_updated', handleContactUpdate);
    };
  }, [ws, user?.id]);

  const triggerAlert = async (alert: Omit<EmergencyAlert, 'id'>) => {
    try {
      const newAlert = await safetyService.triggerEmergencyAlert(alert);
      setActiveAlerts(prev => [...prev, newAlert]);
      
      // Broadcast via WebSocket
      ws?.send('emergency_alert', newAlert);
    } catch (error) {
      console.error('Error triggering alert:', error);
      throw error;
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await safetyService.resolveEmergencyAlert(alertId);
      setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      // Broadcast via WebSocket
      ws?.send('alert_resolved', alertId);
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  };

  return (
    <SafetyAlertContext.Provider
      value={{
        activeAlerts,
        emergencyContacts,
        triggerAlert,
        resolveAlert,
      }}
    >
      {children}
    </SafetyAlertContext.Provider>
  );
};

export const useSafetyAlerts = () => {
  const context = useContext(SafetyAlertContext);
  if (context === undefined) {
    throw new Error('useSafetyAlerts must be used within a SafetyAlertProvider');
  }
  return context;
};
