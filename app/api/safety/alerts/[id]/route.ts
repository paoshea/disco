import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import { SafetyAlert } from '@prisma/client';
import type { SafetyAlertType } from '@/types/safety';
import { z } from 'zod';

const ActionSchema = z.object({
  action: z.enum(['dismiss', 'resolve']),
});

interface Context {
  params: Promise<{
    id: string;
  }>;
}

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type SafetyAlertResponse = SafetyAlert & {
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: Date;
  } | null;
};

export async function GET(
  request: NextRequest,
  context: Context
): Promise<NextResponse<SafetyAlertResponse | { error: string }>> {
  try {
    const userId = await validateRequest();
    const params = await context.params;
    const alertResponse = await safetyService.getSafetyAlert(params.id);
    const alert = alertResponse
      ? ({
          ...alertResponse,
          type: alertResponse.type as SafetyAlertType,
          status: alertResponse.dismissed
            ? 'dismissed'
            : alertResponse.resolved
              ? 'resolved'
              : 'active',
          location: (() => {
            if (
              typeof alertResponse.location === 'object' &&
              alertResponse.location
            ) {
              const loc = alertResponse.location as Record<string, unknown>;
              const locData = {
                latitude:
                  typeof loc.latitude === 'number'
                    ? loc.latitude
                    : Number(loc.latitude),
                longitude:
                  typeof loc.longitude === 'number'
                    ? loc.longitude
                    : Number(loc.longitude),
                accuracy:
                  loc.accuracy !== undefined ? Number(loc.accuracy) : undefined,
                timestamp: new Date(loc.timestamp as string | number | Date),
              };
              return locData;
            }
            return null;
          })(),
        } as SafetyAlertResponse)
      : null;

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    if (alert.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(alert);
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    const userId = await validateRequest();
    const params = await context.params;
    const body = await request.json();
    const result = ActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error },
        { status: 400 }
      );
    }

    const { action } = result.data;
    if (action === 'dismiss') {
      const updatedAlert = await safetyService.dismissAlert(params.id, userId);
      return NextResponse.json(updatedAlert);
    } else if (action === 'resolve') {
      const updatedAlert = await safetyService.resolveAlert(params.id, userId);
      return NextResponse.json(updatedAlert);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
