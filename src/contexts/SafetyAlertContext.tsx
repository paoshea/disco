import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EmergencyAlert, EmergencyContact as SafetyEmergencyContact } from '@/types/safety';
import { EmergencyContact as UserEmergencyContact } from '@/types/user';
import { safetyService } from '@/services/api/safety.service';
import { toSafetyContact } from '@/utils/contactTypes';
import { socketService } from '@/services/websocket/socket.service';

interface SafetyAlertContextType {
  activeAlerts: EmergencyAlert[];
  emergencyContacts: SafetyEmergencyContact[];
  triggerAlert: (alert: Omit<EmergencyAlert, 'id'>) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  addAlert: (alert: EmergencyAlert) => void;
  removeAlert: (alertId: string) => void;
}

const SafetyAlertContext = createContext<SafetyAlertContextType | undefined>(undefined);

interface SafetyAlertProviderProps {
  children: React.ReactNode;
}

export const SafetyAlertProvider: React.FC<SafetyAlertProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<SafetyEmergencyContact[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        if (!user?.id) return;
        const [alerts, contacts] = await Promise.all([
          safetyService.getActiveAlerts(user.id),
          safetyService.getEmergencyContacts(user.id),
        ]);
        setActiveAlerts(alerts);
        // Convert user contacts to safety contacts
        const safetyContacts = contacts.map(contact => toSafetyContact(contact, user.id));
        setEmergencyContacts(safetyContacts);
      } catch (error) {
        console.error('Error loading safety data:', error);
      }
    };
    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

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
      setEmergencyContacts(prev => prev.map(c => (c.id === safetyContact.id ? safetyContact : c)));
    };

    socketService.subscribe('emergency_alert', handleEmergencyAlert);
    socketService.subscribe('alert_resolved', handleAlertResolution);
    socketService.subscribe('contact_updated', handleContactUpdate);

    return () => {
      socketService.unsubscribe('emergency_alert', handleEmergencyAlert);
      socketService.unsubscribe('alert_resolved', handleAlertResolution);
      socketService.unsubscribe('contact_updated', handleContactUpdate);
    };
  }, [user?.id]);

  const triggerAlert = async (alert: Omit<EmergencyAlert, 'id'>) => {
    try {
      const newAlert = await safetyService.triggerEmergencyAlert(alert);
      setActiveAlerts(prev => [...prev, newAlert]);

      // Broadcast via WebSocket
      socketService.emit('emergency_alert', newAlert);
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
      socketService.emit('alert_resolved', alertId);
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  };

  const addAlert = (alert: EmergencyAlert) => {
    setActiveAlerts(prev => [...prev, alert]);
  };

  const removeAlert = (alertId: string) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <SafetyAlertContext.Provider
      value={{
        activeAlerts,
        emergencyContacts,
        triggerAlert,
        resolveAlert,
        addAlert,
        removeAlert,
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
