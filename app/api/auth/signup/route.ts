import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import type { SignupInput } from '@/types/auth';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/,
      'Password must contain at least one number, one uppercase and one lowercase letter'
    ),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = result.data;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = randomUUID();

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        verificationToken,
        role: 'user',
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Generate token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );

    // Set auth token cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
