import { AxiosResponse } from 'axios';
import { EmergencyContact } from '@/types/user';
import {
  EmergencyAlert,
  SafetyCheck,
  SafetyReport,
  SafetySettings,
  IncidentStatus,
  VerificationStatus,
} from '@/types/safety';
import { api } from './api';

class SafetyService {
  // Safety Settings
  async getSettings(userId: string): Promise<SafetySettings> {
    const response: AxiosResponse<SafetySettings> = await api.get(`/safety/settings/${userId}`);
    return response.data;
  }

  async updateSettings(userId: string, settings: Partial<SafetySettings>): Promise<SafetySettings> {
    const response: AxiosResponse<SafetySettings> = await api.put(
      `/safety/settings/${userId}`,
      settings
    );
    return response.data;
  }

  // Emergency Contact Management
  async createEmergencyContact(
    userId: string,
    contact: Omit<EmergencyContact, 'id'>
  ): Promise<EmergencyContact> {
    const response: AxiosResponse<EmergencyContact> = await api.post(
      `/safety/emergency-contacts/${userId}`,
      contact
    );
    return response.data;
  }

  async updateEmergencyContact(
    userId: string,
    contactId: string,
    contact: Partial<EmergencyContact>
  ): Promise<EmergencyContact> {
    const response: AxiosResponse<EmergencyContact> = await api.put(
      `/safety/emergency-contacts/${userId}/${contactId}`,
      contact
    );
    return response.data;
  }

  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    await api.delete(`/safety/emergency-contacts/${userId}/${contactId}`);
  }

  // Emergency Alerts
  async getEmergencyAlerts(userId: string): Promise<EmergencyAlert[]> {
    const response: AxiosResponse<{ alerts: EmergencyAlert[] }> = await api.get(
      `/safety/alerts/${userId}`
    );
    return response.data.alerts;
  }

  async triggerEmergencyAlert(
    userId: string,
    alert: Partial<EmergencyAlert>
  ): Promise<EmergencyAlert> {
    const response: AxiosResponse<EmergencyAlert> = await api.post(
      `/safety/alerts/${userId}`,
      alert
    );
    return response.data;
  }

  async dismissEmergencyAlert(userId: string, alertId: string): Promise<void> {
    await api.put(`/safety/alerts/${userId}/${alertId}/dismiss`);
  }

  // Safety Checks
  async getSafetyChecks(userId: string): Promise<SafetyCheck[]> {
    const response: AxiosResponse<{ checks: SafetyCheck[] }> = await api.get(
      `/safety/checks/${userId}`
    );
    return response.data.checks;
  }

  async resolveSafetyCheck(
    userId: string,
    checkId: string,
    resolution: { status: 'safe' | 'unsafe'; notes?: string }
  ): Promise<SafetyCheck> {
    const response: AxiosResponse<SafetyCheck> = await api.put(
      `/safety/checks/${userId}/${checkId}/resolve`,
      resolution
    );
    return response.data;
  }

  // Safety Reports
  async createSafetyReport(userId: string, report: Partial<SafetyReport>): Promise<SafetyReport> {
    const response: AxiosResponse<SafetyReport> = await api.post(
      `/safety/reports/${userId}`,
      report
    );
    return response.data;
  }

  async updateSafetyReport(
    userId: string,
    reportId: string,
    updates: Partial<SafetyReport>
  ): Promise<SafetyReport> {
    const response: AxiosResponse<SafetyReport> = await api.put(
      `/safety/reports/${userId}/${reportId}`,
      updates
    );
    return response.data;
  }

  async getSafetyReports(userId: string): Promise<SafetyReport[]> {
    const response: AxiosResponse<{ reports: SafetyReport[] }> = await api.get(
      `/safety/reports/${userId}`
    );
    return response.data.reports;
  }

  // Verification
  async requestVerification(userId: string): Promise<void> {
    await api.post(`/safety/verification/${userId}/request`);
  }

  async updateVerificationStatus(
    userId: string,
    status: VerificationStatus,
    notes?: string
  ): Promise<void> {
    await api.put(`/safety/verification/${userId}/status`, { status, notes });
  }

  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    const response: AxiosResponse<{ status: VerificationStatus }> = await api.get(
      `/safety/verification/${userId}/status`
    );
    return response.data.status;
  }
}

export const safetyService = new SafetyService();
