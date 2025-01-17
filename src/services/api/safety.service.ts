import axios, { AxiosResponse } from 'axios';
import { apiClient } from './api.client';
import {
  SafetyAlert,
  SafetyCheck,
  SafetySettingsNew,
  SafetyReport,
  EmergencyContact,
  SafetyEvidence,
  VerificationStatus,
} from '@/types/safety';
import { Location } from '@/types/location';
import { WebSocketMessage } from '@/types/websocket';

interface SafetyAlertCreateData {
  type: string;
  description?: string;
  location?: Location;
}

interface SafetyCheckCreateData {
  userId: string;
  type: string;
  scheduledFor: string;
  location?: Location;
}

interface SafetyReportCreateData {
  type: string;
  description: string;
  userId: string;
  evidence?: File[];
}

class SafetyService {
  private readonly baseUrl = '/safety';

  // Safety Settings
  async getSettings(userId: string): Promise<SafetySettingsNew> {
    const response = await apiClient.get<SafetySettingsNew>(`${this.baseUrl}/settings/${userId}`);
    return response.data;
  }

  async updateSettings(userId: string, settings: Partial<SafetySettingsNew>): Promise<SafetySettingsNew> {
    const response = await apiClient.put<SafetySettingsNew>(
      `${this.baseUrl}/settings/${userId}`,
      settings
    );
    return response.data;
  }

  async updateSafetyFeature(userId: string, feature: keyof SafetySettingsNew, enabled: boolean): Promise<SafetySettingsNew> {
    return this.updateSettings(userId, { [feature]: enabled });
  }

  // Emergency Contact Management
  async createEmergencyContact(
    userId: string,
    contact: Omit<EmergencyContact, 'id'>
  ): Promise<EmergencyContact> {
    const response = await apiClient.post<EmergencyContact>(
      `${this.baseUrl}/emergency-contacts/${userId}`,
      contact
    );
    return response.data;
  }

  async updateEmergencyContact(
    userId: string,
    contactId: string,
    contact: Partial<EmergencyContact>
  ): Promise<EmergencyContact> {
    const response = await apiClient.put<EmergencyContact>(
      `${this.baseUrl}/emergency-contacts/${userId}/${contactId}`,
      contact
    );
    return response.data;
  }

  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/emergency-contacts/${userId}/${contactId}`);
  }

  // Emergency Alerts
  async getEmergencyAlerts(userId: string): Promise<SafetyAlert[]> {
    const response = await apiClient.get<{ alerts: SafetyAlert[] }>(
      `${this.baseUrl}/alerts/${userId}`
    );
    return response.data.alerts;
  }

  async triggerEmergencyAlert(userId: string, alert: Partial<SafetyAlert>): Promise<SafetyAlert> {
    const response = await apiClient.post<SafetyAlert>(`${this.baseUrl}/alerts/${userId}`, alert);
    return response.data;
  }

  async dismissEmergencyAlert(userId: string, alertId: string): Promise<void> {
    await apiClient.put(`${this.baseUrl}/alerts/${userId}/${alertId}/dismiss`);
  }

  // Safety Checks
  async getSafetyChecks(userId: string): Promise<SafetyCheck[]> {
    const response = await apiClient.get<{ checks: SafetyCheck[] }>(
      `${this.baseUrl}/checks/${userId}`
    );
    return response.data.checks;
  }

  async resolveSafetyCheck(
    userId: string,
    checkId: string,
    resolution: { status: 'safe' | 'unsafe'; notes?: string }
  ): Promise<SafetyCheck> {
    const response = await apiClient.put<SafetyCheck>(
      `${this.baseUrl}/checks/${userId}/${checkId}/resolve`,
      resolution
    );
    return response.data;
  }

  // Safety Reports
  async createSafetyReport(userId: string, report: Partial<SafetyReport>): Promise<SafetyReport> {
    const response = await apiClient.post<SafetyReport>(
      `${this.baseUrl}/reports/${userId}`,
      report
    );
    return response.data;
  }

  async updateSafetyReport(
    userId: string,
    reportId: string,
    updates: Partial<SafetyReport>
  ): Promise<SafetyReport> {
    const response = await apiClient.put<SafetyReport>(
      `${this.baseUrl}/reports/${userId}/${reportId}`,
      updates
    );
    return response.data;
  }

  async getSafetyReports(userId: string): Promise<SafetyReport[]> {
    const response = await apiClient.get<{ reports: SafetyReport[] }>(
      `${this.baseUrl}/reports/${userId}`
    );
    return response.data.reports;
  }

  // Verification
  async requestVerification(userId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/verification/${userId}/request`);
  }

  async updateVerificationStatus(
    userId: string,
    status: VerificationStatus,
    notes?: string
  ): Promise<void> {
    await apiClient.put(`${this.baseUrl}/verification/${userId}/status`, { status, notes });
  }

  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    const response = await apiClient.get<{ status: VerificationStatus }>(
      `${this.baseUrl}/verification/${userId}/status`
    );
    return response.data.status;
  }

  async getAlerts(): Promise<SafetyAlert[]> {
    const response = await apiClient.get<{ alerts: SafetyAlert[] }>(`${this.baseUrl}/alerts`);
    return response.data.alerts;
  }

  async createAlert(data: SafetyAlertCreateData): Promise<SafetyAlert> {
    const response = await apiClient.post<{ alert: SafetyAlert }>(`${this.baseUrl}/alerts`, data);
    return response.data.alert;
  }

  async resolveAlert(id: string): Promise<SafetyAlert> {
    const response = await apiClient.post<{ alert: SafetyAlert }>(
      `${this.baseUrl}/alerts/${id}/resolve`
    );
    return response.data.alert;
  }

  async getChecks(): Promise<SafetyCheck[]> {
    const response = await apiClient.get<{ checks: SafetyCheck[] }>(`${this.baseUrl}/checks`);
    return response.data.checks;
  }

  async createCheck(data: SafetyCheckCreateData): Promise<SafetyCheck> {
    const response = await apiClient.post<{ check: SafetyCheck }>(`${this.baseUrl}/checks`, data);
    return response.data.check;
  }

  async respondToCheck(id: string, isOk: boolean): Promise<SafetyCheck> {
    const checkResponse = await apiClient.post<{ check: SafetyCheck }>(
      `${this.baseUrl}/checks/${id}/respond`,
      { response: isOk }
    );
    return checkResponse.data.check;
  }

  async createReport(data: SafetyReportCreateData): Promise<SafetyReport> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('description', data.description);
    formData.append('userId', data.userId);

    if (data.evidence) {
      data.evidence.forEach((file, index) => {
        formData.append(`evidence[${index}]`, file);
      });
    }

    const response = await apiClient.post<{ report: SafetyReport }>(
      `${this.baseUrl}/reports`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.report;
  }

  // WebSocket Subscriptions
  subscribeToAlerts(callback: (alert: SafetyAlert) => void) {
    // Implementation depends on your WebSocket setup
    const handleMessage = (message: WebSocketMessage) => {
      if (message.type === 'safety_alert') {
        callback(message.payload as SafetyAlert);
      }
    };

    // Return an object with unsubscribe method
    return {
      unsubscribe: () => {
        // Cleanup WebSocket subscription
      },
    };
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

export const safetyService = new SafetyService();
