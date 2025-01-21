import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import { SafetyAlertSchema } from '@/schemas/safety.schema';
import { ZodError } from 'zod';

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

// GET /api/safety/alerts
export async function GET() {
  try {
    const userId = await validateRequest();
    const alerts = await safetyService.getActiveAlerts(userId);
    return NextResponse.json(alerts);
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

// POST /api/safety/alerts
export async function POST(request: Request) {
  try {
    const userId = await validateRequest();
    const requestData = await request.json();

    try {
      const validatedData = SafetyAlertSchema.safeParse(requestData);
      if (!validatedData.success) {
        return NextResponse.json(
          { error: 'Invalid safety alert data', details: validatedData.error },
          { status: 400 }
        );
      }

      const alert = await safetyService.createSafetyAlert(
        userId,
        validatedData.data
      );
      return NextResponse.json(alert);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: 'Invalid safety alert data', details: error.errors },
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
