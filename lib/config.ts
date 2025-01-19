// Server configuration
export const SERVER_PORT = process.env.PORT || 3001;
export const BASE_URL = `http://localhost:${SERVER_PORT}`;
export const WS_BASE_URL = `ws://localhost:${SERVER_PORT}`;

// App URLs
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace('$PORT', SERVER_PORT.toString()) ||
  BASE_URL;
export const WS_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL?.replace(
    '$PORT',
    SERVER_PORT.toString()
  ) || `${WS_BASE_URL}/ws`;
export const NEXTAUTH_URL =
  process.env.NEXTAUTH_URL?.replace('$PORT', SERVER_PORT.toString()) ||
  BASE_URL;

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Email configuration
export const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  from: process.env.EMAIL_FROM || 'noreply@disco.com',
};

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL;
