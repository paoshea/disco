import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as z.infer<typeof RequestSchema>;
    const result = RequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({
        message:
          'If an account exists with that email, a password reset link has been sent.',
      });
    }

    // Generate password reset token
    const token = await generatePasswordResetToken(user.email);

    // Create password reset record
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, token);

    return NextResponse.json({
      message:
        'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
