const emailTransporter = require('../src/lib/email/transporter').transporter;
const { generateToken, verifyToken } = require('../src/lib/jwt');
const WS = require('ws');

async function verifyEmailService() {
  console.log('\n🔍 Verifying Email Service...');
  try {
    await emailTransporter.verify();
    console.log('✅ Email service connection successful');
  } catch (error) {
    console.error('❌ Email service error:', error instanceof Error ? error.message : error);
  }
}

function verifyJWT() {
  console.log('\n🔍 Verifying JWT Configuration...');
  try {
    const testPayload = { userId: 'test-user', email: 'test@example.com' };
    const token = generateToken({ id: 'test-user', email: 'test@example.com' } as any);
    const decoded = verifyToken(token);
    console.log('✅ JWT configuration is working');
    console.log('Generated token:', token.substring(0, 20) + '...');
    console.log('Decoded payload:', decoded);
  } catch (error) {
    console.error('❌ JWT configuration error:', error instanceof Error ? error.message : error);
  }
}

function verifyWebSocket() {
  console.log('\n🔍 Verifying WebSocket URL...');
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  
  if (!wsUrl) {
    console.error('❌ NEXT_PUBLIC_WEBSOCKET_URL is not set');
    return;
  }

  try {
    const ws = new WS(wsUrl);
    
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

async function main() {
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
