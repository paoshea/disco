
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const portSchema = z.string().transform((val) => {
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 3001 : parsed;
});

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PORT: portSchema,
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_WEBSOCKET_URL: z
      .string()
      .url()
      .default(`ws://0.0.0.0:${process.env.PORT || '3001'}/ws`),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  },
});
