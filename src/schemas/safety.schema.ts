
import { z } from 'zod';

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  timestamp: z.date(),
});

export const SafetyAlertSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['sos', 'meetup', 'location', 'custom', 'emergency']),
  status: z.enum(['active', 'resolved', 'dismissed']),
  location: LocationSchema,
  message: z.string().optional(),
  contacts: z.array(z.string()).optional(),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  resolvedAt: z.string().optional()
});

export const SafetyCheckSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['meetup', 'location', 'custom']),
  status: z.enum(['pending', 'completed', 'missed']),
  scheduledFor: z.string(),
  completedAt: z.string().optional(),
  location: LocationSchema.optional(),
  description: z.string().optional()
});

export const NotifyOnSchema = z.object({
  sosAlert: z.boolean(),
  meetupStart: z.boolean(),
  meetupEnd: z.boolean(),
  lowBattery: z.boolean(),
  enterPrivacyZone: z.boolean(),
  exitPrivacyZone: z.boolean()
});

export const EmergencyContactSchema = z.object({
  id: z.string(),
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  notifyOn: NotifyOnSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

export const SafetySettingsSchema = z.object({
  autoShareLocation: z.boolean(),
  meetupCheckins: z.boolean(),
  sosAlertEnabled: z.boolean(),
  requireVerifiedMatch: z.boolean(),
  emergencyContacts: z.array(EmergencyContactSchema)
});

// Export inferred types
export type SafetyAlert = z.infer<typeof SafetyAlertSchema>;
export type SafetyCheck = z.infer<typeof SafetyCheckSchema>;
export type SafetySettings = z.infer<typeof SafetySettingsSchema>;
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;
export type Location = z.infer<typeof LocationSchema>;
