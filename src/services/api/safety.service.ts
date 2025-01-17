import { AxiosResponse } from 'axios';
import { EmergencyContact } from '@/types/user';
import {
  EmergencyAlert,
  SafetyCheck,
  SafetyReport,
  SafetySettings,
  VerificationStatus,
} from '@/types/safety';
import { api } from './api';

interface SafetyAlertCreateData {
  type: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface SafetyCheckCreateData {
  type: string;
  userId: string;
  description?: string;
}

interface SafetyReportCreateData {
  type: string;
  description: string;
  userId: string;
  evidence?: File[];
}

class SafetyService {
  // Safety Settings
  async getSettings(userId: string): Promise<SafetySettings> {
    try {
      const response: AxiosResponse<SafetySettings> = await api.get(`/safety/settings/${userId}`);
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateSettings(userId: string, settings: Partial<SafetySettings>): Promise<SafetySettings> {
    try {
      const response: AxiosResponse<SafetySettings> = await api.put(
        `/safety/settings/${userId}`,
        settings
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  // Emergency Contact Management
  async createEmergencyContact(
    userId: string,
    contact: Omit<EmergencyContact, 'id'>
  ): Promise<EmergencyContact> {
    try {
      const response: AxiosResponse<EmergencyContact> = await api.post(
        `/safety/emergency-contacts/${userId}`,
        contact
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateEmergencyContact(
    userId: string,
    contactId: string,
    contact: Partial<EmergencyContact>
  ): Promise<EmergencyContact> {
    try {
      const response: AxiosResponse<EmergencyContact> = await api.put(
        `/safety/emergency-contacts/${userId}/${contactId}`,
        contact
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async deleteEmergencyContact(userId: string, contactId: string): Promise<void> {
    try {
      await api.delete(`/safety/emergency-contacts/${userId}/${contactId}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  // Emergency Alerts
  async getEmergencyAlerts(userId: string): Promise<EmergencyAlert[]> {
    try {
      const response: AxiosResponse<{ alerts: EmergencyAlert[] }> = await api.get(
        `/safety/alerts/${userId}`
      );
      return response.data.alerts;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async triggerEmergencyAlert(
    userId: string,
    alert: Partial<EmergencyAlert>
  ): Promise<EmergencyAlert> {
    try {
      const response: AxiosResponse<EmergencyAlert> = await api.post(
        `/safety/alerts/${userId}`,
        alert
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async dismissEmergencyAlert(userId: string, alertId: string): Promise<void> {
    try {
      await api.put(`/safety/alerts/${userId}/${alertId}/dismiss`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  // Safety Checks
  async getSafetyChecks(userId: string): Promise<SafetyCheck[]> {
    try {
      const response: AxiosResponse<{ checks: SafetyCheck[] }> = await api.get(
        `/safety/checks/${userId}`
      );
      return response.data.checks;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async resolveSafetyCheck(
    userId: string,
    checkId: string,
    resolution: { status: 'safe' | 'unsafe'; notes?: string }
  ): Promise<SafetyCheck> {
    try {
      const response: AxiosResponse<SafetyCheck> = await api.put(
        `/safety/checks/${userId}/${checkId}/resolve`,
        resolution
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  // Safety Reports
  async createSafetyReport(userId: string, report: Partial<SafetyReport>): Promise<SafetyReport> {
    try {
      const response: AxiosResponse<SafetyReport> = await api.post(
        `/safety/reports/${userId}`,
        report
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateSafetyReport(
    userId: string,
    reportId: string,
    updates: Partial<SafetyReport>
  ): Promise<SafetyReport> {
    try {
      const response: AxiosResponse<SafetyReport> = await api.put(
        `/safety/reports/${userId}/${reportId}`,
        updates
      );
      return response.data;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getSafetyReports(userId: string): Promise<SafetyReport[]> {
    try {
      const response: AxiosResponse<{ reports: SafetyReport[] }> = await api.get(
        `/safety/reports/${userId}`
      );
      return response.data.reports;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  // Verification
  async requestVerification(userId: string): Promise<void> {
    try {
      await api.post(`/safety/verification/${userId}/request`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateVerificationStatus(
    userId: string,
    status: VerificationStatus,
    notes?: string
  ): Promise<void> {
    try {
      await api.put(`/safety/verification/${userId}/status`, { status, notes });
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    try {
      const response: AxiosResponse<{ status: VerificationStatus }> = await api.get(
        `/safety/verification/${userId}/status`
      );
      return response.data.status;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getAlerts(): Promise<SafetyAlert[]> {
    try {
      const response = await api.get<{ alerts: SafetyAlert[] }>('/safety/alerts');
      return response.data.alerts;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async createAlert(data: SafetyAlertCreateData): Promise<SafetyAlert> {
    try {
      const response = await api.post<{ alert: SafetyAlert }>('/safety/alerts', data);
      return response.data.alert;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async resolveAlert(id: string): Promise<SafetyAlert> {
    try {
      const response = await api.post<{ alert: SafetyAlert }>(
        `/safety/alerts/${id}/resolve`
      );
      return response.data.alert;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getChecks(): Promise<SafetyCheck[]> {
    try {
      const response = await api.get<{ checks: SafetyCheck[] }>('/safety/checks');
      return response.data.checks;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async createCheck(data: SafetyCheckCreateData): Promise<SafetyCheck> {
    try {
      const response = await api.post<{ check: SafetyCheck }>(
        '/safety/checks',
        data
      );
      return response.data.check;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async respondToCheck(id: string, response: boolean): Promise<SafetyCheck> {
    try {
      const responseData = await api.post<{ check: SafetyCheck }>(
        `/safety/checks/${id}/respond`,
        { response }
      );
      return responseData.data.check;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async createReport(data: SafetyReportCreateData): Promise<SafetyReport> {
    try {
      const formData = new FormData();
      formData.append('type', data.type);
      formData.append('description', data.description);
      formData.append('userId', data.userId);

      if (data.evidence) {
        data.evidence.forEach((file, index) => {
          formData.append(`evidence[${index}]`, file);
        });
      }

      const response = await api.post<{ report: SafetyReport }>(
        '/safety/reports',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.report;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

export const safetyService = new SafetyService();
