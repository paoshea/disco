import { prisma } from '@/lib/prisma';
import type { 
  SafetyAlert, 
  SafetyCheck,
  SafetySettingsNew,
  SafetyReport,
} from '@/types/safety';
import { Prisma } from '@prisma/client';

interface SafetyCheckInput {
  type: string;
  description: string;
  scheduledFor: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

interface SafetyAlertInput {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  message?: string;
}

export const safetyService = {
  async getSafetyAlert(id: string) {
    return prisma.safetyAlert.findUnique({
      where: { id },
    });
  },

  async getSafetyAlerts(userId: string) {
    return prisma.safetyAlert.findMany({
      where: {
        userId,
        dismissed: false,
      },
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
    userId: string,
    data: SafetyAlertInput
  ): Promise<SafetyAlert> {
    const alert = await prisma.safetyAlert.create({
      data: {
        userId,
        type: data.type,
        priority: data.severity,
        message: data.message ?? null,
        description: data.description,
        location: data.location 
          ? (data.location as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        dismissed: false,
        resolved: false,
      },
    });

    return {
      ...alert,
      status: 'active',
      contactedEmergencyServices: false,
      notifiedContacts: [],
    };
  },

  async createSafetyCheck(
    userId: string,
    data: SafetyCheckInput
  ): Promise<SafetyCheck> {
    const check = await prisma.safetyCheck.create({
      data: {
        userId,
        type: data.type,
        status: 'pending',
        description: data.description,
        scheduledFor: new Date(data.scheduledFor),
        location: data.location 
          ? (data.location as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        completedAt: null,
      },
    });

    return {
      ...check,
      scheduledTime: check.scheduledFor.toISOString(),
      notifiedContacts: [],
    };
  },

  async updateSafetySettings(
    userId: string,
    data: Partial<SafetySettingsNew>
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        safetyPreferences: data as Prisma.InputJsonValue,
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
};
