import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LocationService } from '@/services/location/location.service';
import type { LocationPrivacyMode } from '@/types/location';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const locationService = LocationService.getInstance();
    const locationState = await locationService.getLocationState(session.user.id);

    return NextResponse.json(locationState);
  } catch (error) {
    console.error('Error getting location state:', error);
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

    const { latitude, longitude, accuracy, privacyMode } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const locationService = LocationService.getInstance();
    const result = await locationService.updateLocation(
      session.user.id,
      {
        latitude,
        longitude,
        accuracy,
        privacyMode: privacyMode as LocationPrivacyMode
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ location: result.data });
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

    const { privacyMode, sharingEnabled } = await request.json();

    const locationService = LocationService.getInstance();
    const result = await locationService.updateLocationState(session.user.id, {
      privacyMode: privacyMode as LocationPrivacyMode,
      sharingEnabled
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ location: result.data });
  } catch (error) {
    console.error('Error updating location state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
