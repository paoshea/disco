import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { eventService } from '@/services/event/event.service';
import { withRoleGuard } from '@/path/to/withRoleGuard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

interface CreateEventBody {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  latitude: number;
  longitude: number;
  type: 'social' | 'virtual' | 'hybrid';
  maxParticipants?: number;
  tags?: string[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const lat = parseFloat(searchParams.get('lat') ?? '0');
    const lng = parseFloat(searchParams.get('lng') ?? '0');
    const radius = parseFloat(searchParams.get('radius') ?? '500');

    if (lat && lng) {
      const result = await eventService.getNearbyEvents(lat, lng, radius);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result.data);
    } else {
      const result = await eventService.getEvents();

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(result.data);
    }
  } catch (error) {
    console.error('Error in GET /api/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Assuming withRoleGuard is defined elsewhere and handles the role check
  export const POST = withRoleGuard(async (request: NextRequest): Promise<NextResponse> => {
  try {
    const session = await getServerAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as CreateEventBody;

    // Validate required fields
    if (
      !body.title ||
      !body.startTime ||
      !body.latitude ||
      !body.longitude ||
      !body.type
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create event using the validated body
    const result = await eventService.createEvent({
      ...body,
      startTime: new Date(body.startTime),
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      creatorId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in POST /api/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});