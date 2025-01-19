import type { EmergencyContact, EmergencyContactNew } from '@/types/safety';

/**
 * Safety Emergency Contact (from safety system)
 * - Used in emergency situations and safety features
 * - Contains user association (userId)
 * - Has simple notification array
 * - Tracks creation and update times
 * - Uses 'phone' instead of 'phoneNumber'
 *
 * @example
 * {
 *   id: "123",
 *   userId: "456",
 *   name: "John Doe",
 *   phone: "+1234567890",
 *   email: "john@example.com",
 *   relation: "Father",
 *   notifyOn: ["sos", "meetup"],
 *   createdAt: "2025-01-16T20:06:40-06:00",
 *   updatedAt: "2025-01-16T20:06:40-06:00"
 * }
 */

/**
 * Converts a user emergency contact to a safety emergency contact
 * @param contact - The user emergency contact to convert
 * @param userId - The ID of the user associated with this contact
 * @returns A safety emergency contact with the same information
 */
export const toSafetyContact = (
  contact: Omit<EmergencyContact, 'userId'>,
  userId: string
): EmergencyContactNew => {
  return {
    id: contact.id,
    name: contact.name,
    phone: contact.phoneNumber,
    email: contact.email,
    relationship: contact.relationship,
    isVerified: true,
    userId,
    createdAt: contact.createdAt || new Date().toISOString(),
    updatedAt: contact.updatedAt || new Date().toISOString(),
  };
};

/**
 * Converts a safety emergency contact to a user emergency contact
 * @param contact - The safety emergency contact to convert
 * @returns A user emergency contact with the same information
 */
export const toUserContact = (contact: EmergencyContact): EmergencyContact => {
  return {
    id: contact.id,
    userId: contact.userId,
    name: contact.name,
    relationship: contact.relationship,
    phoneNumber: contact.phoneNumber,
    email: contact.email,
    notifyOn: {
      sosAlert: contact.notifyOn.sosAlert,
      meetupStart: contact.notifyOn.meetupStart,
      meetupEnd: contact.notifyOn.meetupEnd,
      lowBattery: contact.notifyOn.lowBattery,
      enterPrivacyZone: contact.notifyOn.enterPrivacyZone,
      exitPrivacyZone: contact.notifyOn.exitPrivacyZone,
    },
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
};

export type ContactStatus = 'pending' | 'verified' | 'rejected';

export interface ContactEvent {
  type: string;
  contact: EmergencyContact;
  timestamp: string;
}

export const CONTACT_STATUSES = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export const CONTACT_TYPES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  EMERGENCY: 'emergency',
} as const;

export type ContactType = 'emergency' | 'trusted' | 'blocked';

export interface Contact {
  id: string;
  userId: string;
  contactUserId: string;
  type: ContactType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactWithUser extends Contact {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}
