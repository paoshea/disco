import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { User } from '@/types/user';

// TODO: Replace with actual database calls
const MOCK_USERS: Record<string, User> = {
  '1': {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: false,
    interests: [],
    status: 'offline',
    emergencyContacts: [],
    verificationStatus: 'unverified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // In production, you would:
    // 1. Verify the JWT token
    // 2. Get user data from database
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const user = MOCK_USERS[decoded.userId];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
