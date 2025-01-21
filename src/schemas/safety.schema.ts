import { z } from 'zod';

export const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
});

export const SafetyAlertSchema = z.object({
  type: z.string(),
  description: z.string(),
  message: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
  location: LocationSchema.optional(),
});

export const SafetyCheckSchema = z.object({
  type: z.enum(['meetup', 'location', 'custom']),
  description: z.string(),
  scheduledFor: z.string().datetime(),
  location: LocationSchema.optional(),
});

const NotifyOnSchema = z.object({
  sosAlert: z.boolean(),
  meetupStart: z.boolean(),
  meetupEnd: z.boolean(),
  lowBattery: z.boolean(),
  enterPrivacyZone: z.boolean(),
  exitPrivacyZone: z.boolean(),
});

export const EmergencyContactSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  relationship: z.string(),
  phoneNumber: z.string(),
  email: z.string().email().optional(),
  notifyOn: NotifyOnSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SafetySettingsSchema = z.object({
  autoShareLocation: z.boolean(),
  meetupCheckins: z.boolean(),
  sosAlertEnabled: z.boolean(),
  requireVerifiedMatch: z.boolean(),
  emergencyContacts: z.array(EmergencyContactSchema),
});

// Export types for use in services
export type SafetyAlert = z.infer<typeof SafetyAlertSchema>;
export type SafetyCheck = z.infer<typeof SafetyCheckSchema>;
export type SafetySettings = z.infer<typeof SafetySettingsSchema>;
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;

// Export Prisma-compatible types
export type SafetyAlertCreateInput = Omit<SafetyAlert, 'severity'> & {
  priority: string;
};

export type SafetyCheckCreateInput = SafetyCheck & {
  status: 'pending' | 'completed' | 'cancelled';
  completedAt: Date | null;
};
