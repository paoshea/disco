import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import { z } from 'zod';

const ActionSchema = z.object({
  action: z.enum(['dismiss', 'resolve']),
});

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/safety/alerts/[id]
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const userId = await validateRequest();
    const alert = await safetyService.getSafetyAlert(params.id);

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    if (alert.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(alert);
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

// PUT /api/safety/alerts/[id]
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const body = (await request.json()) as z.infer<typeof ActionSchema>;
    const result = ActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error },
        { status: 400 }
      );
    }

    const { action } = result.data;

    if (action === 'dismiss') {
      const userId = await validateRequest();
      const alertId = params.id;

      const updatedAlert = await safetyService.dismissAlert(alertId, userId);

      return NextResponse.json(updatedAlert);
    } else if (action === 'resolve') {
      const userId = await validateRequest();
      const alertId = params.id;

      const updatedAlert = await safetyService.resolveAlert(alertId, userId);

      return NextResponse.json(updatedAlert);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
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
