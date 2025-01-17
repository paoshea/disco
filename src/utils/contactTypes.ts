import { EmergencyContact as UserEmergencyContact } from '@/types/user';
import { EmergencyContact as SafetyEmergencyContact } from '@/types/safety';

type NotificationEvent = 'sosAlert' | 'meetupStart' | 'meetupEnd';
type SafetyNotificationEvent = 'sos' | 'meetup';

interface NotificationPreferences {
  sosAlert: boolean;
  meetupStart: boolean;
  meetupEnd: boolean;
}

/**
 * User Emergency Contact (from user profile)
 * - Used in user profiles and general contact management
 * - Contains relationship information
 * - Has structured notification preferences
 * - Does not track creation/update timestamps
 *
 * @example
 * {
 *   id: "123",
 *   name: "John Doe",
 *   relationship: "Father",
 *   phoneNumber: "+1234567890",
 *   email: "john@example.com",
 *   notifyOn: {
 *     sosAlert: true,
 *     meetupStart: true,
 *     meetupEnd: false
 *   }
 * }
 */

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
  contact: UserEmergencyContact,
  userId: string
): SafetyEmergencyContact => {
  return {
    id: contact.id,
    userId,
    name: contact.name,
    phoneNumber: contact.phoneNumber,
    email: contact.email || '',
    relationship: contact.relationship,
    isVerified: false,
    isPrimary: false,
  };
};

/**
 * Converts a safety emergency contact to a user emergency contact
 * @param contact - The safety emergency contact to convert
 * @returns A user emergency contact with the same information
 */
export const toUserContact = (contact: SafetyEmergencyContact): UserEmergencyContact => {
  // Create notification preferences object
  const notifyPrefs: NotificationPreferences = {
    sosAlert: false,
    meetupStart: false,
    meetupEnd: false,
  };

  return {
    id: contact.id,
    name: contact.name,
    relationship: contact.relationship,
    phoneNumber: contact.phoneNumber,
    email: contact.email || '',
    notifyOn: notifyPrefs,
  };
};

export type ContactStatus = 'pending' | 'verified' | 'rejected';

export interface ContactEvent {
  type: string;
  contact: SafetyEmergencyContact;
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
