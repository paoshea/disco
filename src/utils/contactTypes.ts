import { EmergencyContact as UserEmergencyContact } from '@/types/user';
import { EmergencyContact as SafetyEmergencyContact, VerificationStatus } from '@/types/safety';

type NotificationEvent = 'sosAlert' | 'meetupStart' | 'meetupEnd';
type SafetyNotificationEvent = 'sos' | 'meetup';

interface NotificationPreferences {
  sosAlert: boolean;
  meetupStart: boolean;
  meetupEnd: boolean;
}

/**
 * Maps user notification events to safety notification events
 */
const EVENT_MAP: Record<NotificationEvent, SafetyNotificationEvent> = {
  sosAlert: 'sos',
  meetupStart: 'meetup',
  meetupEnd: 'meetup',
};

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
  const now = new Date().toISOString();

  // Convert notification preferences to array and filter out unknown events
  const notifyOn = Object.entries(contact.notifyOn)
    .filter((entry): entry is [NotificationEvent, boolean] => {
      const [key, value] = entry;
      return (
        typeof value === 'boolean' &&
        (key === 'sosAlert' || key === 'meetupStart' || key === 'meetupEnd')
      );
    })
    .filter(([_, enabled]) => enabled)
    .map(([event]) => EVENT_MAP[event]);

  // Remove duplicates
  const uniqueNotifyOn = Array.from(new Set(notifyOn));

  return {
    id: contact.id,
    userId,
    name: contact.name,
    phoneNumber: contact.phoneNumber,
    email: contact.email || '',
    relationship: contact.relationship,
    isVerified: contact.verificationStatus === 'verified',
    isPrimary: contact.isPrimary || false,
    notifyOn: uniqueNotifyOn,
    verificationStatus: 'unverified' as VerificationStatus,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Converts a safety emergency contact to a user emergency contact
 * @param contact - The safety emergency contact to convert
 * @returns A user emergency contact with the same information
 */
export const toUserContact = (contact: SafetyEmergencyContact): UserEmergencyContact => {
  // Ensure email is never null/undefined
  const email = contact.email || '';

  // Ensure relationship is never null/undefined
  const relationship = contact.relation || '';

  // Create notification preferences object
  const notifyOn: NotificationPreferences = {
    sosAlert: contact.notifyOn.includes('sos'),
    meetupStart: contact.notifyOn.includes('meetup'),
    meetupEnd: contact.notifyOn.includes('meetup'),
  };

  return {
    id: contact.id,
    name: contact.name,
    relationship,
    phoneNumber: contact.phoneNumber,
    email,
    isPrimary: contact.isPrimary,
    isVerified: contact.isVerified,
    notifyOn,
  };
};
