import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import { SafetyCheckSchema } from '@/schemas/safety.schema';
import { ZodError } from 'zod';

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export async function GET() {
  try {
    const userId = await validateRequest();
    const checks = await safetyService.getSafetyChecks(userId);
    return NextResponse.json(checks);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await validateRequest();
    const requestData = await request.json();

    try {
      const validatedData = SafetyCheckSchema.safeParse(requestData);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: 'Invalid safety check data', details: validatedData.error },
          { status: 400 }
        );
      }

      const check = await safetyService.createSafetyCheck(userId, {
        type: validatedData.data.type,
        description: validatedData.data.description,
        scheduledFor: validatedData.data.scheduledFor || new Date().toISOString(),
        location: validatedData.data.location,
      });
      return NextResponse.json(check);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Invalid safety check data', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
