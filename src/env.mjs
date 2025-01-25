import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const portSchema = z.preprocess((val): number => {
 const processed = z.string().safeParse(val);
 return processed.success ? parseInt(processed.data, 10) : 3001;
}, z.number().min(1).max(65535));

export const env = createEnv({
 server: {
   NODE_ENV: z.enum(['development', 'test', 'production']),
   PORT: portSchema,
   REDIS_HOST: z.string().default('0.0.0.0'),
   REDIS_PORT: portSchema.default(6379),
   REDIS_PASSWORD: z.string().optional(),
 },
 client: {
   NEXT_PUBLIC_APP_URL: z.string().url(),
   NEXT_PUBLIC_WEBSOCKET_URL: z
     .string()
     .url()
     .default(`ws://0.0.0.0:${process.env.PORT ?? '3001'}/ws`),
 },
 runtimeEnv: process.env as {
   NODE_ENV: string;
   PORT: string;
   REDIS_HOST: string;
   REDIS_PORT: string;
   REDIS_PASSWORD?: string;
   NEXT_PUBLIC_APP_URL: string;
   NEXT_PUBLIC_WEBSOCKET_URL: string;
 },
});