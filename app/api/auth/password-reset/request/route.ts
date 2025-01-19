import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

interface PasswordResetRequest {
  email: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as PasswordResetRequest;
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        message:
          'If an account exists with that email, a password reset link has been sent.',
      });
    }

    const resetResult = await generatePasswordResetToken(user.email);

    if (!resetResult) {
      return NextResponse.json(
        { message: 'An error occurred while processing your request' },
        { status: 500 }
      );
    }

    // Create a new password reset record
    await db.passwordReset.create({
      data: {
        token: resetResult.token,
        userId: user.id,
        expiresAt: resetResult.expiresAt,
      },
    });

    await sendPasswordResetEmail(email, resetResult.token);

    return NextResponse.json({
      message:
        'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
