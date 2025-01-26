
'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { safetyService } from '@/services/api/safety.service';

export async function GET(request: NextRequest) {
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
    const data = await request.json();
    const settings = await safetyService.updateSafetySettings(data);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update safety settings' },
      { status: 500 }
    );
  }
}
