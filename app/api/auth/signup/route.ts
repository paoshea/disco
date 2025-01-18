import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
// Will be needed when we add email verification
// import { generateVerificationToken } from '@/lib/auth';
// import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const requestBody = (await request.json()) as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };
    const { email, password, firstName, lastName } = requestBody;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Basic password validation (at least 8 chars, 1 number, 1 uppercase, 1 lowercase)
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          message:
            'Password must be at least 8 characters and contain at least one number, one uppercase and one lowercase letter',
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // For email verification later:
    // const verificationToken = generateVerificationToken();

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        emailVerified: true, // Temporarily set to true since we're not doing email verification yet
        // verificationToken, // Will be needed when we add email verification
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // For email verification later:
    // await sendVerificationEmail(email, verificationToken);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      role: 'user',
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
