import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SafetyAlertSchema } from '@/schemas/safety.schema';
import type { SafetyAlertNew, SafetyAlertType } from '@/types/safety';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
};

async function validateRequest() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const alerts = await prisma.safetyAlert.findMany();
  return NextResponse.json(alerts);
}

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const data = await request.json();
  
  const alert = await prisma.safetyAlert.create({
    data
  });

  return NextResponse.json(alert, { status: 201 });
}
