import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { User } from '@/types/user';

// TODO: Replace with actual database calls
const MOCK_USERS: Record<string, User & { password: string }> = {
  'test@example.com': {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    password: 'password123', // In production, this would be hashed
    emailVerified: false,
    interests: [],
    status: 'offline',
    emergencyContacts: [],
    verificationStatus: 'unverified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = MOCK_USERS[email];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In production, you would:
    // 1. Hash the password before comparing
    // 2. Use a proper JWT library
    // 3. Store user data in a database
    const token = Buffer.from(
      JSON.stringify({ userId: user.id, email: user.email })
    ).toString('base64');

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
