import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as LoginRequest;
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        streakCount: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password hash
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        streakCount: user.streakCount,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
