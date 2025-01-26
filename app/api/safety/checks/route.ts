import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import { SafetyCheckSchema } from '@/schemas/safety.schema';
import type { SafetyCheck } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type CheckResponse = {
  checks?: SafetyCheck[];
  check?: SafetyCheck;
  error?: string;
  details?: unknown;
};

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export async function GET(): Promise<NextResponse<CheckResponse>> {
  try {
    const userId = await validateRequest();
    const checks = await safetyService.getSafetyChecks(userId);
    return NextResponse.json({ checks });
  } catch (error) {
    console.error('Failed to fetch safety checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety checks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<CheckResponse>> {
  try {
    const userId = await validateRequest();
    const body = await request.json();

    const result = SafetyCheckSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid safety check data', details: result.error },
        { status: 400 }
      );
    }

    const { type, description, location, scheduledFor } = result.data;
    const check = await safetyService.createSafetyCheck(userId, {
      type,
      description,
      location,
      scheduledFor: scheduledFor || new Date().toISOString(),
    });

    const serializedLocation = check.location ? {
      latitude: check.location.latitude,
      longitude: check.location.longitude,
      accuracy: check.location.accuracy || null,
      timestamp: new Date(check.location.timestamp).toISOString()
    } : null;

    const serializedCheck: SafetyCheck = {
      ...check,
      createdAt: new Date(check.createdAt),
      updatedAt: new Date(check.updatedAt),
      scheduledFor: new Date(check.scheduledFor),
      location: serializedLocation,
      completedAt: check.completedAt ? new Date(check.completedAt) : null,
      description: check.description || ''
    };

    return NextResponse.json({ check: serializedCheck });
  } catch (error) {
    console.error('Failed to create safety check:', error);
    return NextResponse.json(
      { error: 'Failed to create safety check' },
      { status: 500 }
    );
  }
}
