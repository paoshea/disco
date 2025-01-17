import { AxiosResponse } from 'axios';
import { EmergencyContact } from '@/types/user';
import { EmergencyAlert, SafetyCheck, SafetyReport, AlertStatus } from '@/types/safety';
import { api } from './api';

class SafetyService {
  // Emergency Contact Management
  async createEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const response: AxiosResponse<EmergencyContact> = await api.post('/safety/emergency-contacts', contact);
    return response.data;
  }

  async updateEmergencyContact(
    id: string,
    contact: Partial<EmergencyContact>
  ): Promise<EmergencyContact> {
    const response: AxiosResponse<EmergencyContact> = await api.put(`/safety/emergency-contacts/${id}`, contact);
    return response.data;
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    await api.delete(`/safety/emergency-contacts/${contactId}`);
  }

  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    const response: AxiosResponse<EmergencyContact[]> = await api.get(`/safety/emergency-contacts/${userId}`);
    return response.data;
  }

  // Safety Reports
  async createSafetyReport(
    report: Omit<SafetyReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SafetyReport> {
    const response: AxiosResponse<SafetyReport> = await api.post('/safety/reports', report);
    return response.data;
  }

  async getSafetyReports(userId: string): Promise<SafetyReport[]> {
    const response: AxiosResponse<SafetyReport[]> = await api.get(`/safety/reports/${userId}`);
    return response.data;
  }

  // Emergency Alerts
  async getActiveAlerts(userId: string): Promise<EmergencyAlert[]> {
    const response: AxiosResponse<EmergencyAlert[]> = await api.get(`/safety/emergency-alert/active/${userId}`);
    return response.data;
  }

  async triggerEmergencyAlert(alert: Omit<EmergencyAlert, 'id'>): Promise<EmergencyAlert> {
    const response: AxiosResponse<EmergencyAlert> = await api.post('/safety/emergency-alert', alert);
    return response.data;
  }

  async resolveEmergencyAlert(alertId: string): Promise<EmergencyAlert> {
    const response: AxiosResponse<EmergencyAlert> = await api.put(`/safety/emergency-alert/${alertId}`, {
      status: AlertStatus.RESOLVED,
    });
    return response.data;
  }

  // Safety Checks
  async getSafetyChecks(userId: string): Promise<SafetyCheck[]> {
    const response: AxiosResponse<SafetyCheck[]> = await api.get(`/safety/checks/${userId}`);
    return response.data;
  }

  async respondToSafetyCheck(checkId: string, isOkay: boolean): Promise<SafetyCheck> {
    const response: AxiosResponse<SafetyCheck> = await api.put(`/safety/checks/${checkId}/respond`, {
      isOkay,
    });
    return response.data;
  }
}

export const safetyService = new SafetyService();
