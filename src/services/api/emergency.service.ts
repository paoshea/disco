import { Location } from '@/types/location';
import { EmergencyContact, EmergencyAlert } from '@/types/safety';
import { apiClient } from './api.client';

class EmergencyService {
  private readonly baseUrl = '/emergency';

  async sendAlert(data: { location: Location; timestamp: string }): Promise<EmergencyAlert> {
    const response = await apiClient.post<EmergencyAlert>(`${this.baseUrl}/alerts`, data);
    return response.data;
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    const response = await apiClient.get<{ contacts: EmergencyContact[] }>(
      `${this.baseUrl}/contacts`
    );
    return response.data.contacts;
  }

  async addEmergencyContact(contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const response = await apiClient.post<EmergencyContact>(`${this.baseUrl}/contacts`, contact);
    return response.data;
  }

  async updateEmergencyContact(
    contactId: string,
    updates: Partial<EmergencyContact>
  ): Promise<EmergencyContact> {
    const response = await apiClient.put<EmergencyContact>(
      `${this.baseUrl}/contacts/${contactId}`,
      updates
    );
    return response.data;
  }

  async removeEmergencyContact(contactId: string): Promise<void> {
    await apiClient.delete<void>(`${this.baseUrl}/contacts/${contactId}`);
  }

  async verifyEmergencyContact(contactId: string, code: string): Promise<EmergencyContact> {
    const response = await apiClient.post<EmergencyContact>(
      `${this.baseUrl}/contacts/${contactId}/verify`,
      { code }
    );
    return response.data;
  }

  async resendVerificationCode(contactId: string): Promise<void> {
    await apiClient.post<void>(`${this.baseUrl}/contacts/${contactId}/resend-code`);
  }

  async getActiveAlerts(): Promise<EmergencyAlert[]> {
    const response = await apiClient.get<{ alerts: EmergencyAlert[] }>(
      `${this.baseUrl}/alerts/active`
    );
    return response.data.alerts;
  }

  async resolveAlert(alertId: string): Promise<void> {
    await apiClient.post<void>(`${this.baseUrl}/alerts/${alertId}/resolve`);
  }

  async uploadEvidence(
    alertId: string,
    file: File,
    description?: string
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    interface UploadResponse {
      url: string;
    }

    const response = await apiClient.post<UploadResponse>(
      `${this.baseUrl}/alerts/${alertId}/evidence`,
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

export const emergencyService = new EmergencyService();
