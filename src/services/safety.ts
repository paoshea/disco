import { EmergencyContact, SafetyReport, EmergencyAlert, SafetyCheck } from '@/types/safety';

class SafetyService {
  // Emergency Contacts
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    const response = await fetch(`/api/safety/contacts?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch emergency contacts');
    return response.json();
  }

  async createEmergencyContact(contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const response = await fetch('/api/safety/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    if (!response.ok) throw new Error('Failed to create emergency contact');
    return response.json();
  }

  async updateEmergencyContact(id: string, contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const response = await fetch(`/api/safety/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    if (!response.ok) throw new Error('Failed to update emergency contact');
    return response.json();
  }

  async deleteEmergencyContact(id: string): Promise<void> {
    const response = await fetch(`/api/safety/contacts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete emergency contact');
  }

  // Safety Reports
  async getSafetyReports(userId: string): Promise<SafetyReport[]> {
    const response = await fetch(`/api/safety/reports?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch safety reports');
    return response.json();
  }

  async createSafetyReport(report: Partial<SafetyReport>): Promise<SafetyReport> {
    const response = await fetch('/api/safety/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (!response.ok) throw new Error('Failed to create safety report');
    return response.json();
  }

  async updateSafetyReport(id: string, report: Partial<SafetyReport>): Promise<SafetyReport> {
    const response = await fetch(`/api/safety/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (!response.ok) throw new Error('Failed to update safety report');
    return response.json();
  }

  // Emergency Alerts
  async getActiveAlerts(userId: string): Promise<EmergencyAlert[]> {
    const response = await fetch(`/api/safety/alerts?userId=${userId}&status=active`);
    if (!response.ok) throw new Error('Failed to fetch active alerts');
    return response.json();
  }

  async createEmergencyAlert(alert: Partial<EmergencyAlert>): Promise<EmergencyAlert> {
    const response = await fetch('/api/safety/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert),
    });
    if (!response.ok) throw new Error('Failed to create emergency alert');
    return response.json();
  }

  async resolveAlert(id: string): Promise<EmergencyAlert> {
    const response = await fetch(`/api/safety/alerts/${id}/resolve`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to resolve alert');
    return response.json();
  }

  // Safety Checks
  async getSafetyChecks(userId: string): Promise<SafetyCheck[]> {
    const response = await fetch(`/api/safety/checks?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch safety checks');
    return response.json();
  }

  async createSafetyCheck(check: Partial<SafetyCheck>): Promise<SafetyCheck> {
    const response = await fetch('/api/safety/checks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(check),
    });
    if (!response.ok) throw new Error('Failed to create safety check');
    return response.json();
  }

  async respondToSafetyCheck(id: string, response: 'safe' | 'unsafe', location?: { latitude: number; longitude: number; accuracy: number }): Promise<SafetyCheck> {
    const payload = { response, location };
    const res = await fetch(`/api/safety/checks/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to respond to safety check');
    return res.json();
  }
}

export const safetyService = new SafetyService();
