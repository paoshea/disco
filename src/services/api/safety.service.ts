import {
  EmergencyContact,
  SafetyAlert,
  SafetyCheck,
  SafetySettingsNew,
  SafetyReport,
} from '@/types/safety';
import { Location } from '@/types/location';
import { apiClient } from './api.client';

class SafetyService {
  private readonly baseUrl = '/safety';

  // Emergency Contacts
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    const response = await apiClient.get<{ contacts: EmergencyContact[] }>(
      `${this.baseUrl}/users/${userId}/contacts`
    );
    return response.data.contacts;
  }

  async addEmergencyContact(
    userId: string,
    contact: Omit<EmergencyContact, 'id'>
  ): Promise<EmergencyContact> {
    const response = await apiClient.post<{ contact: EmergencyContact }>(
      `${this.baseUrl}/users/${userId}/contacts`,
      contact
    );
    return response.data.contact;
  }

  async updateEmergencyContact(
    userId: string,
    contactId: string,
    updates: Partial<EmergencyContact>
  ): Promise<EmergencyContact> {
    const response = await apiClient.put<{ contact: EmergencyContact }>(
      `${this.baseUrl}/users/${userId}/contacts/${contactId}`,
      updates
    );
    return response.data.contact;
  }

  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/users/${userId}/contacts/${contactId}`);
  }

  // Safety Checks
  async getSafetyChecks(userId: string): Promise<SafetyCheck[]> {
    const response = await apiClient.get<{ checks: SafetyCheck[] }>(
      `${this.baseUrl}/users/${userId}/checks`
    );
    return response.data.checks;
  }

  async createSafetyCheck(userId: string, check: Omit<SafetyCheck, 'id'>): Promise<SafetyCheck> {
    const response = await apiClient.post<{ check: SafetyCheck }>(
      `${this.baseUrl}/users/${userId}/checks`,
      check
    );
    return response.data.check;
  }

  async updateSafetyCheck(
    userId: string,
    checkId: string,
    updates: Partial<SafetyCheck>
  ): Promise<SafetyCheck> {
    const response = await apiClient.put<{ check: SafetyCheck }>(
      `${this.baseUrl}/users/${userId}/checks/${checkId}`,
      updates
    );
    return response.data.check;
  }

  async deleteSafetyCheck(userId: string, checkId: string): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/users/${userId}/checks/${checkId}`);
  }

  async completeSafetyCheck(userId: string, checkId: string): Promise<SafetyCheck> {
    const response = await apiClient.post<{ check: SafetyCheck }>(
      `${this.baseUrl}/users/${userId}/checks/${checkId}/complete`
    );
    return response.data.check;
  }

  async resolveSafetyCheck(
    userId: string,
    checkId: string,
    data: { status: 'safe' | 'unsafe'; notes?: string }
  ): Promise<SafetyCheck> {
    const response = await apiClient.post<{ check: SafetyCheck }>(
      `${this.baseUrl}/users/${userId}/checks/${checkId}/resolve`,
      data
    );
    return response.data.check;
  }

  // Safety Alerts
  async getSafetyAlerts(userId: string): Promise<SafetyAlert[]> {
    const response = await apiClient.get<{ alerts: SafetyAlert[] }>(
      `${this.baseUrl}/users/${userId}/alerts`
    );
    return response.data.alerts;
  }

  async createSafetyAlert(userId: string, alert: Omit<SafetyAlert, 'id'>): Promise<SafetyAlert> {
    const response = await apiClient.post<{ alert: SafetyAlert }>(
      `${this.baseUrl}/users/${userId}/alerts`,
      alert
    );
    return response.data.alert;
  }

  async triggerEmergencyAlert(
    userId: string,
    data: { type: string; message: string; location?: Location }
  ): Promise<SafetyAlert> {
    const response = await apiClient.post<{ alert: SafetyAlert }>(
      `${this.baseUrl}/users/${userId}/alerts/emergency`,
      data
    );
    return response.data.alert;
  }

  async dismissEmergencyAlert(userId: string, alertId: string): Promise<void> {
    await apiClient.post<void>(
      `${this.baseUrl}/users/${userId}/alerts/${alertId}/dismiss`
    );
  }

  async createAlert(data: {
    type: string;
    description?: string;
    location?: Location;
  }): Promise<SafetyAlert> {
    const response = await apiClient.post<{ alert: SafetyAlert }>(
      `${this.baseUrl}/alerts`,
      data
    );
    return response.data.alert;
  }

  async resolveAlert(alertId: string): Promise<SafetyAlert> {
    const response = await apiClient.post<{ alert: SafetyAlert }>(
      `${this.baseUrl}/alerts/${alertId}/resolve`
    );
    return response.data.alert;
  }

  async updateSafetyAlert(
    userId: string,
    alertId: string,
    updates: Partial<SafetyAlert>
  ): Promise<SafetyAlert> {
    const response = await apiClient.put<{ alert: SafetyAlert }>(
      `${this.baseUrl}/users/${userId}/alerts/${alertId}`,
      updates
    );
    return response.data.alert;
  }

  async resolveSafetyAlert(userId: string, alertId: string): Promise<SafetyAlert> {
    const response = await apiClient.post<{ alert: SafetyAlert }>(
      `${this.baseUrl}/users/${userId}/alerts/${alertId}/resolve`
    );
    return response.data.alert;
  }

  // Safety Settings
  async getSafetySettings(userId: string): Promise<SafetySettingsNew> {
    const response = await apiClient.get<{ settings: SafetySettingsNew }>(
      `${this.baseUrl}/users/${userId}/settings`
    );
    return response.data.settings;
  }

  async updateSafetySettings(
    userId: string,
    updates: Partial<SafetySettingsNew>
  ): Promise<SafetySettingsNew> {
    const response = await apiClient.put<{ settings: SafetySettingsNew }>(
      `${this.baseUrl}/users/${userId}/settings`,
      updates
    );
    return response.data.settings;
  }

  // Safety Reports
  async createSafetyReport(
    userId: string,
    report: Omit<SafetyReport, 'id'>
  ): Promise<SafetyReport> {
    const response = await apiClient.post<{ report: SafetyReport }>(
      `${this.baseUrl}/users/${userId}/reports`,
      report
    );
    return response.data.report;
  }

  async uploadEvidence(userId: string, alertId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ url: string }>(
      `${this.baseUrl}/users/${userId}/alerts/${alertId}/evidence`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}

export const safetyService = new SafetyService();
