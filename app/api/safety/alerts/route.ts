import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SafetyAlertSchema } from '@/schemas/safety.schema';
import { prisma } from '@/lib/prisma';

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

export async function GET(_request: NextRequest): Promise<NextResponse> {
  const alerts = await prisma.safetyAlert.findMany();
  return NextResponse.json(alerts);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = await validateRequest();
  const data = await request.json();

  // Validate the data using SafetyAlertSchema
  const parsedData = SafetyAlertSchema.safeParse(data);
  if (!parsedData.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsedData.error.errors },
      { status: 400 }
    );
  }

  const alert = await prisma.safetyAlert.create({
    data: {
      ...parsedData.data,
      userId,
      location: parsedData.data.location as LocationData,
    },
  });

  return NextResponse.json(alert, { status: 201 });
}
