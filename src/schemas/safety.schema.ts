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
  type: z.string(),
  description: z.string(),
  scheduledFor: z.string().datetime().optional(),
  location: LocationSchema.optional(),
});

export const SafetySettingsSchema = z.object({
  emergencyContactsEnabled: z.boolean(),
  locationTrackingEnabled: z.boolean(),
  privacyZonesEnabled: z.boolean(),
});

// Export types for use in services
export type SafetyAlert = z.infer<typeof SafetyAlertSchema>;
export type SafetyCheck = z.infer<typeof SafetyCheckSchema>;
export type SafetySettings = z.infer<typeof SafetySettingsSchema>;

// Export Prisma-compatible types
export type SafetyAlertCreateInput = Omit<SafetyAlert, 'severity'> & {
  priority: string;
};

export type SafetyCheckCreateInput = SafetyCheck & {
  status: 'pending' | 'completed' | 'cancelled';
  completedAt: Date | null;
};
