'use server';

import { prisma } from '@/lib/prisma';
import type {
  SafetyAlertType,
  SafetyAlertNew,
  SafetyCheckNew,
  SafetyReport,
  EmergencyContact,
  EmergencyContactInput,
} from '@/types/safety';
import type { LocationPrivacyMode } from '@/types/location';
import { Prisma, ReportType, ReportStatus, SafetyAlert } from '@prisma/client';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface SafetyLocationData extends LocationData {
  timestamp: Date;
}

interface SafetyCheckInput {
  type: 'meetup' | 'location' | 'custom';
  description: string;
  scheduledFor: string;
  location?: LocationData;
}

interface SafetyAlertInput {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  location?: LocationData;
  message?: string;
}

export const getSafetyAlerts = async (userId: string) => {
  const response = await fetch(`/api/safety/alerts?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch safety alerts');
  }
  return response.json();
};

export const createSafetyAlert = async (
  data: Omit<SafetyAlert, 'id' | 'createdAt'>
) => {
  const response = await fetch('/api/safety/alerts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create safety alert');
  }
  return response.json();
};

export const safetyService = {
  async getSafetyAlert(id: string) {
    return prisma.safetyAlert.findUnique({
      where: { id },
    });
  },

  async getSafetyAlerts(userId: string) {
    return await prisma.safetyAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getActiveAlerts(userId: string) {
    return prisma.safetyAlert.findMany({
      where: {
        userId,
        dismissed: false,
        resolved: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getSafetyChecks(userId: string) {
    return prisma.safetyCheck.findMany({
      where: {
        userId,
        status: 'pending',
      },
      orderBy: { scheduledFor: 'asc' },
    });
  },

  async createSafetyAlert(
    data: Omit<SafetyAlert, 'id' | 'createdAt'>
  ): Promise<SafetyAlertNew> {
    const alert = await prisma.safetyAlert.create({ data });

    const locationData: SafetyLocationData | null = null; //Simplified

    return {
      id: alert.id,
      userId: alert.userId,
      type: alert.type as SafetyAlertType,
      status: alert.dismissed
        ? 'dismissed'
        : alert.resolved
          ? 'resolved'
          : 'active',
      location: locationData || {
        latitude: 0,
        longitude: 0,
        timestamp: new Date(),
      },
      message: alert.message || undefined,
      description: alert.description || undefined,
      evidence: [],
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
      resolvedAt: alert.resolvedAt?.toISOString(),
    };
  },

  async createSafetyCheck(
    userId: string,
    check: SafetyCheckInput
  ): Promise<SafetyCheckNew> {
    const now = new Date();

    // Convert location to a JSON-safe format
    const locationJson = check.location
      ? {
          type: 'Point',
          coordinates: [check.location.latitude, check.location.longitude],
          accuracy: check.location.accuracy,
          timestamp: now.toISOString(),
        }
      : null;

    const newCheck = await prisma.safetyCheck.create({
      data: {
        userId,
        type: check.type,
        description: check.description,
        scheduledFor: new Date(check.scheduledFor),
        location: locationJson
          ? (locationJson as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        status: 'pending',
      },
    });

    // Convert stored JSON location back to Location type
    const storedLocation = newCheck.location as {
      type: string;
      coordinates: number[];
      accuracy?: number;
      timestamp: string;
    } | null;

    // Create a proper Location object
    const location = storedLocation
      ? {
          id: `${newCheck.id}_location`,
          userId: newCheck.userId,
          latitude: storedLocation.coordinates[0],
          longitude: storedLocation.coordinates[1],
          accuracy: storedLocation.accuracy,
          timestamp: new Date(storedLocation.timestamp),
          privacyMode: 'precise' as LocationPrivacyMode,
          sharingEnabled: true,
        }
      : undefined;

    return {
      id: newCheck.id,
      userId: newCheck.userId,
      type: newCheck.type as 'meetup' | 'location' | 'custom',
      status: newCheck.status as 'pending' | 'completed' | 'missed',
      description: newCheck.description,
      scheduledFor: newCheck.scheduledFor.toISOString(),
      location,
      createdAt: newCheck.createdAt.toISOString(),
      updatedAt: newCheck.updatedAt.toISOString(),
      completedAt: newCheck.completedAt?.toISOString(),
    };
  },

  async updateSafetySettings(
    userId: string
    // TODO: Define proper settings type and implement settings update
    // settings: Record<string, unknown>
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        updatedAt: new Date(),
      },
    });
  },

  async dismissAlert(alertId: string, userId: string): Promise<void> {
    await prisma.safetyAlert.update({
      where: {
        id: alertId,
        userId,
      },
      data: {
        dismissed: true,
        dismissedAt: new Date(),
      },
    });
  },

  async resolveAlert(alertId: string, userId: string): Promise<void> {
    await prisma.safetyAlert.update({
      where: {
        id: alertId,
        userId,
      },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });
  },

  async createSafetyReport(
    userId: string,
    data: {
      reportedUserId: string;
      type: 'harassment' | 'inappropriate' | 'spam' | 'scam' | 'other';
      description: string;
      evidence?: Array<{
        type: string;
        url: string;
      }>;
      createdAt: string;
      updatedAt: string;
    }
  ): Promise<SafetyReport> {
    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        reportedUserId: data.reportedUserId,
        type: data.type as ReportType,
        description: data.description,
        evidence: data.evidence
          ? (data.evidence as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        status: ReportStatus.pending,
      },
    });

    return {
      id: report.id,
      reporterId: report.reporterId,
      reportedUserId: report.reportedUserId,
      type: report.type.toLowerCase() as
        | 'harassment'
        | 'inappropriate'
        | 'spam'
        | 'scam'
        | 'other',
      description: report.description,
      evidence: report.evidence as
        | Array<{
            type: string;
            url: string;
          }>
        | undefined,
      status: report.status.toLowerCase() as
        | 'pending'
        | 'reviewing'
        | 'resolved'
        | 'dismissed',
      adminNotes: report.adminNotes || undefined,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      resolvedAt: report.resolvedAt?.toISOString(),
    };
  },

  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    const contacts = await prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return contacts.map(contact => ({
      id: contact.id,
      userId: contact.userId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumber: contact.phoneNumber || undefined,
      email: contact.email || undefined,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }));
  },

  async addEmergencyContact(
    userId: string,
    contact: EmergencyContactInput
  ): Promise<EmergencyContact> {
    const newContact = await prisma.emergencyContact.create({
      data: {
        userId,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phoneNumber: contact.phoneNumber,
      },
    });

    return {
      id: newContact.id,
      userId: newContact.userId,
      firstName: newContact.firstName,
      lastName: newContact.lastName,
      email: newContact.email || undefined,
      phoneNumber: newContact.phoneNumber || undefined,
      createdAt: newContact.createdAt.toISOString(),
      updatedAt: newContact.updatedAt.toISOString(),
    };
  },

  async updateEmergencyContact(
    userId: string,
    contactId: string,
    updates: Partial<EmergencyContactInput>
  ): Promise<EmergencyContact> {
    const updatedContact = await prisma.emergencyContact.update({
      where: {
        id: contactId,
        userId, // Ensure the contact belongs to the user
      },
      data: updates,
    });

    return {
      id: updatedContact.id,
      userId: updatedContact.userId,
      firstName: updatedContact.firstName,
      lastName: updatedContact.lastName,
      email: updatedContact.email || undefined,
      phoneNumber: updatedContact.phoneNumber || undefined,
      createdAt: updatedContact.createdAt.toISOString(),
      updatedAt: updatedContact.updatedAt.toISOString(),
    };
  },

  async deleteEmergencyContact(
    userId: string,
    contactId: string
  ): Promise<void> {
    await prisma.emergencyContact.delete({
      where: {
        id: contactId,
        userId, // Ensure the contact belongs to the user
      },
    });
  },
};
