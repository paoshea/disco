import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { sendPasswordResetEmail } from '@/lib/email';
import { db } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/auth';
import type { ResetPasswordInput } from '@/types/auth';

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    if (!requestSchema.safeParse(requestBody).success) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }
    const { email } = requestSchema.parse(requestBody);

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists, a reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate a short-lived token for password reset
    const resetToken = await generatePasswordResetToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
    });

    // Update user with reset token
    await db.user.update({
      where: { id: user.id },
      data: { verificationToken: resetToken },
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json(
      { message: 'If an account exists, a reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
