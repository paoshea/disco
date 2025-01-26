
'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { safetyService } from '@/services/api/safety.service';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        safetyEnabled: true,
        emergencyContacts: true,
      },
    });

    return NextResponse.json({
      sosAlertEnabled: settings?.safetyEnabled ?? false,
      emergencyContacts: settings?.emergencyContacts ?? [],
      autoShareLocation: false,
      meetupCheckins: false,
      requireVerifiedMatch: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch safety settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await safetyService.updateSafetySettings(session.user.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update safety settings' },
      { status: 500 }
    );
  }
}
