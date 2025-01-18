import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendPasswordResetEmail } from '@/lib/email';
import { db } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const requestBody = (await request.json()) as { email: string };
    if (!requestSchema.safeParse(requestBody).success) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }
    const { email } = requestSchema.parse(requestBody);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal whether a user exists
      return NextResponse.json(
        {
          message:
            'If an account exists with this email, a password reset link will be sent.',
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const token = generateToken();

    // Save reset token
    await db.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send reset email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json(
      {
        message:
          'If an account exists with this email, a password reset link will be sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
