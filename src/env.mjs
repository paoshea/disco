import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  PORT: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_WEBSOCKET_URL: z.string().url(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_SECURE: z.string().transform((val) => val === 'true'), // Convert to boolean
  // SMTP_SECURE: z.preprocess((val) => val === 'true', z.boolean()), // Convert to boolean
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string().email(),
  LOCATION_PORT: z.string(),
  LOCATION_REDIS_URL: z.string(),
  LOCATION_REDIS_PASSWORD: z.string(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string(),
  GOOGLE_MAPS_API_KEY: z.string(),
});

// ✅ Validate environment variables
let env;
try {
  env = envSchema.parse(process.env);
  console.log('✅ Environment variables loaded successfully.');
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  process.exit(1);
}

// ✅ Export the validated environment variables
export { env };

// ✅ Safe access to individual variables
export const NODE_ENV = String(env.NODE_ENV);
export const DATABASE_URL = String(env.DATABASE_URL);
export const JWT_SECRET = String(env.JWT_SECRET);

console.log(`Running in ${NODE_ENV} mode`);
console.log(`Connecting to database at ${DATABASE_URL}`);
console.log(`Using JWT secret: ${JWT_SECRET}`);

// ✅ Safe environment variable retrieval
export function getEnvVar(key, defaultValue) {
  const value = env[key];
  if (!value) {
    console.warn(
      `⚠️ Environment variable ${String(key)} is not set. Using default value: ${String(defaultValue)}`
    );
    return String(defaultValue); // ✅ Ensure default value is a string
  }
  return String(value); // ✅ Ensure return value is a string
}

// ✅ Example usage
const exampleVar = getEnvVar('NEXT_PUBLIC_APP_URL', 'https://default-url.com');
console.log(`Example variable: ${exampleVar}`);
