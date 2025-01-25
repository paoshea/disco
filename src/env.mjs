import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PORT: z.string().default('3001'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_WEBSOCKET_URL: z
      .string()
      .url()
      .default(`ws://0.0.0.0:${PORT}/ws`),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  },
});
