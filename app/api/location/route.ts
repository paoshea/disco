import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LocationService } from '@/services/location/location.service';
import type { Location } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const location = await LocationService.getLocation(session.user.id);
    return NextResponse.json({ location });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { latitude, longitude, accuracy, privacyMode } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const location = await LocationService.updateLocation(
      session.user.id,
      latitude,
      longitude,
      accuracy,
      privacyMode
    );

    return NextResponse.json({ location });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    let location: Location | null = null;

    if (action === 'toggleSharing') {
      location = await LocationService.toggleLocationSharing(session.user.id);
    } else if (action === 'updatePrivacy' && body.privacyMode) {
      location = await LocationService.updatePrivacyMode(
        session.user.id,
        body.privacyMode
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ location });
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
