// Replace $PORT with actual port value in URLs
const PORT = process.env.PORT || '3001';
const replacePort = url => url?.replace('$PORT', PORT);

const env = {
  // App Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: PORT,

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Redis Configuration
  REDIS_HOST: process.env.LOCATION_REDIS_URL?.split(':')[0] || 'localhost',
  REDIS_PORT: process.env.LOCATION_REDIS_URL?.split(':')[1] || '6379',
  REDIS_PASSWORD: process.env.LOCATION_REDIS_PASSWORD,

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  NEXTAUTH_URL:
    replacePort(process.env.NEXTAUTH_URL) || `http://localhost:${PORT}`,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

  // Public URLs
  NEXT_PUBLIC_APP_URL:
    replacePort(process.env.NEXT_PUBLIC_APP_URL) || `http://0.0.0.0:${PORT}`,
  NEXT_PUBLIC_WEBSOCKET_URL:
    replacePort(process.env.NEXT_PUBLIC_WEBSOCKET_URL) ||
    `ws://0.0.0.0:${PORT}/ws`,

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@disco.com',
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Location Service
  LOCATION_PORT: process.env.LOCATION_PORT || '8080',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'JWT_SECRET'];

const missingEnvVars = requiredEnvVars.filter(key => !env[key]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

export { env };
