import { prisma } from '@/lib/prisma';
import type { EmergencyContact, SafetyCheck } from '@prisma/client';

interface SafetySettings {
  enabled: boolean;
  emergencyContacts: {
    id: string;
    name: string;
    phone: string;
    email: string;
    priority: 'primary' | 'secondary';
  }[];
}

export class SafetyService {
  private static instance: SafetyService;

  // Private constructor to enforce singleton pattern
  private constructor() {
    // Intentionally empty - initialization is handled through getInstance()
  }

  public static getInstance(): SafetyService {
    if (!SafetyService.instance) {
      SafetyService.instance = new SafetyService();
    }
    return SafetyService.instance;
  }

  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    return await prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addEmergencyContact(
    userId: string,
    contactData: {
      firstName: string;
      lastName: string;
      email?: string;
      phoneNumber?: string;
    }
  ): Promise<EmergencyContact> {
    return await prisma.emergencyContact.create({
      data: {
        ...contactData,
        userId,
      },
    });
  }

  async updateEmergencyContact(
    userId: string,
    contactId: string,
    contactData: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
    }>
  ): Promise<EmergencyContact> {
    const contact = await prisma.emergencyContact.findUnique({
      where: { id: contactId },
    });

    if (!contact || contact.userId !== userId) {
      throw new Error('Contact not found or unauthorized');
    }

    return await prisma.emergencyContact.update({
      where: { id: contactId },
      data: contactData,
    });
  }

  async deleteEmergencyContact(
    userId: string,
    contactId: string
  ): Promise<EmergencyContact> {
    const contact = await prisma.emergencyContact.findUnique({
      where: { id: contactId },
    });

    if (!contact || contact.userId !== userId) {
      throw new Error('Contact not found or unauthorized');
    }

    return await prisma.emergencyContact.delete({
      where: { id: contactId },
    });
  }

  async createSafetyCheck(
    userId: string,
    checkData: {
      type: string;
      scheduledFor: Date;
      location?: { latitude: number; longitude: number; accuracy?: number };
      description: string;
    }
  ): Promise<SafetyCheck> {
    return await prisma.safetyCheck.create({
      data: {
        ...checkData,
        userId,
        status: 'pending',
      },
    });
  }

  async completeSafetyCheck(
    userId: string,
    checkId: string
  ): Promise<SafetyCheck> {
    const check = await prisma.safetyCheck.findUnique({
      where: { id: checkId },
    });

    if (!check || check.userId !== userId) {
      throw new Error('Safety check not found or unauthorized');
    }

    return await prisma.safetyCheck.update({
      where: { id: checkId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  }

  async getSafetyChecks(
    userId: string,
    status?: 'pending' | 'completed' | 'missed'
  ): Promise<SafetyCheck[]> {
    return await prisma.safetyCheck.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: { scheduledFor: 'desc' },
    });
  }

  async getSafetySettings(userId: string): Promise<{ data: SafetySettings }> {
    const contacts = await this.getEmergencyContacts(userId);

    // Get the user's safety preferences from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        safetyEnabled: true, // You'll need to add this field to your User model
      },
    });

    return {
      data: {
        enabled: user?.safetyEnabled ?? false,
        emergencyContacts: contacts.map(contact => ({
          id: contact.id,
          name: `${contact.firstName} ${contact.lastName}`,
          phone: contact.phoneNumber || '',
          email: contact.email || '',
          priority: 'primary' as const, // You might want to add a priority field to your EmergencyContact model
        })),
      },
    };
  }

  async updateSafetySettings(
    userId: string,
    settings: Partial<SafetySettings>
  ): Promise<void> {
    // Update user's safety preferences
    if (settings.enabled !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          safetyEnabled: settings.enabled,
        },
      });
    }

    // Update emergency contacts if provided
    if (settings.emergencyContacts) {
      // Implementation for updating emergency contacts
      // This would involve creating/updating/deleting contacts as needed
      // You might want to implement this based on your specific requirements
    }
  }
}

export const safetyService = SafetyService.getInstance();
