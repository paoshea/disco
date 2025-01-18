import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { User } from '@/types/user';

// TODO: Replace with actual database calls
const users: Record<string, User & { password: string }> = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (users[email]) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const newUser: User & { password: string } = {
      id: Date.now().toString(),
      email,
      password, // In production, this would be hashed
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      emailVerified: false,
      interests: [],
      status: 'offline',
      emergencyContacts: [],
      verificationStatus: 'unverified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users[email] = newUser;

    // In production, you would:
    // 1. Hash the password before storing
    // 2. Use a proper JWT library
    // 3. Store user data in a database
    const token = Buffer.from(JSON.stringify({ userId: newUser.id, email })).toString('base64');

    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      user: userWithoutPassword,
      token,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
