import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateTokens } from '@/lib/auth';
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
    const existingUser = await prisma.user.findUnique({
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
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        verificationToken,
        role: 'user',
        emailVerified: null,
        streakCount: 0,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        streakCount: true,
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

    // Ensure database connection is initialized
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection error. Please try again in a moment.',
        },
        { status: 503 }
      );
    }

    // Generate tokens for automatic login
    const { token, refreshToken, accessTokenExpiresIn } = await generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      streakCount: user.streakCount,
    });

    // Store refresh token in database
    const now = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpiresAt: new Date(
          now.getTime() + accessTokenExpiresIn * 1000
        ),
        lastLogin: now,
      },
    });

    // Create response with tokens
    const response = NextResponse.json({
      success: true,
      message:
        'User created successfully. Please check your email to verify your account.',
      token,
      refreshToken,
      expiresIn: accessTokenExpiresIn,
      needsVerification: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        streakCount: user.streakCount,
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
    });

    // Handle specific error types
    if (err.name === 'PrismaClientInitializationError') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Service temporarily unavailable. Please try again in a moment.',
        },
        { status: 503 }
      );
    }

    if (err.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during signup. Please try again.',
      },
      { status: 500 }
    );
  }
}
