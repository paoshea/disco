import { EmergencyContact } from '@/types/user';
import { EmergencyAlert, SafetyCheck, SafetyReport } from '@/types/safety';
import { api } from './api';

class SafetyService {
  // Emergency Contact Management
  async addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    const response = await api.post('/safety/emergency-contacts', contact);
    return response.data;
  }

  async updateEmergencyContact(id: string, contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const response = await api.put(`/safety/emergency-contacts/${id}`, contact);
    return response.data;
  }

  async removeEmergencyContact(contactId: string): Promise<void> {
    await api.delete(`/safety/emergency-contacts/${contactId}`);
  }

  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    const response = await api.get(`/safety/emergency-contacts/${userId}`);
    return response.data;
  }

  // Emergency Alerts
  async getActiveAlerts(userId: string): Promise<EmergencyAlert[]> {
    const response = await api.get(`/safety/emergency-alert/active/${userId}`);
    return response.data;
  }

  async triggerEmergencyAlert(alert: Omit<EmergencyAlert, 'id'>): Promise<EmergencyAlert> {
    const response = await api.post('/safety/emergency-alert', alert);
    return response.data;
  }

  async resolveEmergencyAlert(id: string): Promise<EmergencyAlert> {
    const response = await api.put(`/safety/emergency-alert/${id}/resolve`);
    return response.data;
  }

  // Safety Checks
  async submitSafetyCheck(check: Omit<SafetyCheck, 'id'>): Promise<SafetyCheck> {
    const response = await api.post('/safety/checks', check);
    return response.data;
  }

  async getSafetyChecks(meetingId: string): Promise<SafetyCheck[]> {
    const response = await api.get(`/safety/checks/${meetingId}`);
    return response.data;
  }

  async scheduleSafetyCheck(meetingId: string, scheduledTime: string): Promise<SafetyCheck> {
    const response = await api.post('/safety/checks/schedule', { meetingId, scheduledTime });
    return response.data;
  }

  // Safety Reports
  async submitReport(report: Omit<SafetyReport, 'id' | 'reporterId' | 'status' | 'resolution'>): Promise<SafetyReport> {
    const response = await api.post('/safety/reports', report);
    return response.data;
  }

  async getReports(userId: string): Promise<SafetyReport[]> {
    const response = await api.get(`/safety/reports/${userId}`);
    return response.data;
  }

  // Evidence Upload
  async uploadEvidence(reportId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportId', reportId);

    const response = await api.post('/safety/evidence', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const safetyService = new SafetyService();
