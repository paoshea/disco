import { z } from 'zod';

const EnvSchema = z.object({
  LOCATION_PORT: z.coerce.number().default(8080),
  LOCATION_REDIS_URL: z.string().default('localhost:6379'),
  LOCATION_REDIS_PASSWORD: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
