import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  PORT: z.string(),
  NEXT_PUBLIC_APP_UR: z.string().url(),
  NEXT_PUBLIC_WEBSOCKET_URL: z.string().url(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_SECURE: z.boolean(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string().email(),
  LOCATION_PORT: z.string(),
  LOCATION_REDIS_URL: z.string(),
  LOCATION_REDIS_PASSWORD: z.string(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string(),
  GOOGLE_MAPS_API_KEY: z.string(),
});

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = env.data;

// Ensure environment variables are properly handled
export const getEnvVar = (key, defaultValue) => {
  const value = env[key];
  if (!value) {
    console.warn(
      `⚠️ Environment variable ${key} is not set. Using default value: ${defaultValue}`
    );
    return defaultValue;
  }
  return value;
};

// Usage example
const exampleVar = getEnvVar('EXAMPLE_VAR', 'default_value');
console.log(`Example variable: ${exampleVar}`);
