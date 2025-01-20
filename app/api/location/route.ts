import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { LocationService } from '@/services/location/location.service';
import type { LocationPrivacyMode } from '@/types/location';

interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  accuracy?: number;
  privacyMode?: LocationPrivacyMode;
}

interface PrivacyUpdateRequest {
  privacyMode: LocationPrivacyMode;
}

export async function GET(_request: NextRequest): Promise<Response> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const locationService = LocationService.getInstance();
    const locationState = await locationService.getLocationState(
      session.user.id
    );

    return NextResponse.json(locationState);
  } catch (error) {
    console.error('Error getting location state:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as LocationUpdateRequest;

    if (!body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (
      body.privacyMode &&
      !['precise', 'approximate', 'zone'].includes(body.privacyMode)
    ) {
      return NextResponse.json(
        { error: 'Invalid privacy mode' },
        { status: 400 }
      );
    }

    const locationService = LocationService.getInstance();
    const result = await locationService.updateLocation(session.user.id, {
      latitude: body.latitude,
      longitude: body.longitude,
      accuracy: body.accuracy,
      privacyMode: body.privacyMode || 'precise',
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as PrivacyUpdateRequest;

    if (
      !body.privacyMode ||
      !['precise', 'approximate', 'zone'].includes(body.privacyMode)
    ) {
      return NextResponse.json(
        { error: 'Invalid privacy mode' },
        { status: 400 }
      );
    }

    const locationService = LocationService.getInstance();
    const result = await locationService.updatePrivacyMode(
      session.user.id,
      body.privacyMode
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating privacy mode:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
