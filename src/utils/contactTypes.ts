import type {
  EmergencyContact,
  EmergencyContactNew,
  EmergencyContactFormData,
} from '@/types/safety';

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
 * @returns A safety emergency contact with the same information
 */
export function toEmergencyContactNew(
  contact: Omit<EmergencyContact, 'userId'>
): EmergencyContactNew {
  return {
    id: contact.id,
    name: `${contact.firstName} ${contact.lastName}`,
    phone: contact.phoneNumber || '',
    email: contact.email || '',
    relationship: 'Contact',
    isVerified: false,
    userId: '',
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
}

/**
 * Converts a safety emergency contact to a user emergency contact
 * @param contact - The safety emergency contact to convert
 * @param userId - The ID of the user associated with this contact
 * @param id - The ID of the contact
 * @param timestamp - The timestamp for creation and update
 * @returns A user emergency contact with the same information
 */
export function toEmergencyContact(
  contact: EmergencyContactFormData,
  userId: string,
  id = '',
  timestamp = new Date().toISOString()
): EmergencyContact {
  return {
    id,
    userId,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phoneNumber: contact.phoneNumber,
    email: contact.email,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

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
