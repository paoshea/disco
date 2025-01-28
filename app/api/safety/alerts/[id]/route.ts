import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import type { SafetyAlert } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ActionSchema = z.object({
  action: z.enum(['dismiss', 'resolve']),
});

type AlertResponse = SafetyAlert | { error: string; details?: unknown };

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<AlertResponse>> {
  const { id } = await context.params;
  const alert = await prisma.safetyAlert.findUnique({
    where: { id },
  });

  if (!alert) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  return NextResponse.json(alert);
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<AlertResponse>> {
  const { id } = await context.params;
  const data = await request.json();

  const alert = await prisma.safetyAlert.update({
    where: { id },
    data,
  });

  return NextResponse.json(alert);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<void>> {
  const { id } = await context.params;
  await prisma.safetyAlert.delete({
    where: { id },
  });

  return new NextResponse(null, { status: 204 });
}
