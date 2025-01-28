import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.string().url(),
  // ...other environment variables...
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.format());
  throw new Error('Invalid environment variables');
}

export const {
  NODE_ENV,
  DATABASE_URL,
  NEXTAUTH_SECRET,
  NEXTAUTH_URL,
  // ...other environment variables...
} = env.data;

// Ensure environment variables are properly handled
export const getEnvVar = (key, defaultValue) => {
  const value = env.data[key];
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
