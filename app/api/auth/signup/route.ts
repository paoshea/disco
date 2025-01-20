import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

interface SignupBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ErrorWithCode extends Error {
  code?: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as SignupBody;
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log('Checking for existing user...');
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    const verificationToken = randomUUID();

    console.log('Creating user...');
    const user = await db.user.create({
      data: {
        email,
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

    console.log('Sending verification email...');
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Don't fail the signup if email fails, but log it
      console.log('User created but verification email failed to send');
    }

    // Generate tokens for automatic login
    const { token, refreshToken, accessTokenExpiresIn } = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Store refresh token in database
    await db.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        lastLogin: new Date(),
      },
    });

    // Create response with tokens
    const response = NextResponse.json({
      message:
        'User created successfully. Please check your email to verify your account.',
      token,
      refreshToken,
      expiresIn: accessTokenExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    // Set auth cookies
    response.cookies.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: accessTokenExpiresIn,
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    const err = error as ErrorWithCode;
    console.error('Signup error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    if (err.code) {
      console.error('Database error code:', err.code);
    }
    return NextResponse.json(
      { message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
