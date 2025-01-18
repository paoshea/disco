import * as nodemailer from 'nodemailer';
import { WebSocket } from 'ws';

// Import types
interface JWTPayload {
  userId: string;
  email: string;
}

interface UserPayload {
  id: string;
  email: string;
}

// Import services
const emailTransporter = require('../src/lib/email/transporter').transporter as nodemailer.Transporter;
const jwtService = require('../src/lib/jwt') as {
  generateToken: (user: UserPayload) => string;
  verifyToken: (token: string) => JWTPayload;
};

async function verifyEmailService(): Promise<void> {
  console.log('\n🔍 Verifying Email Service...');
  try {
    await emailTransporter.verify();
    console.log('✅ Email service connection successful');
  } catch (error) {
    console.error('❌ Email service error:', error instanceof Error ? error.message : error);
  }
}

function verifyJWT(): void {
  console.log('\n🔍 Verifying JWT Configuration...');
  try {
    const testPayload: UserPayload = { id: 'test-user', email: 'test@example.com' };
    const token = jwtService.generateToken(testPayload);
    const decoded = jwtService.verifyToken(token);
    console.log('✅ JWT configuration is working');
    console.log('Generated token:', token.substring(0, 20) + '...');
    console.log('Decoded payload:', decoded);
  } catch (error) {
    console.error('❌ JWT configuration error:', error instanceof Error ? error.message : error);
  }
}

function verifyWebSocket(): void {
  console.log('\n🔍 Verifying WebSocket URL...');
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  
  if (!wsUrl) {
    console.error('❌ NEXT_PUBLIC_WEBSOCKET_URL is not set');
    return;
  }

  try {
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connection successful');
      ws.close();
    });

    ws.on('error', (error: Error) => {
      console.error('❌ WebSocket connection error:', error.message);
      ws.close();
    });
  } catch (error) {
    console.error('❌ WebSocket configuration error:', error instanceof Error ? error.message : error);
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting environment verification...\n');
  
  // Verify Database URL
  console.log('🔍 Checking DATABASE_URL...');
  if (process.env.DATABASE_URL) {
    console.log('✅ DATABASE_URL is set');
  } else {
    console.error('❌ DATABASE_URL is not set');
  }

  // Verify App URL
  console.log('\n🔍 Checking NEXT_PUBLIC_APP_URL...');
  if (process.env.NEXT_PUBLIC_APP_URL) {
    console.log('✅ NEXT_PUBLIC_APP_URL is set:', process.env.NEXT_PUBLIC_APP_URL);
  } else {
    console.error('❌ NEXT_PUBLIC_APP_URL is not set');
  }

  // Verify each service
  await verifyEmailService();
  verifyJWT();
  verifyWebSocket();
}

main().catch(console.error);
