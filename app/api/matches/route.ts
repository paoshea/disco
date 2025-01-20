import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { MatchingService } from '@/services/matching/match.service';
import { rateLimit } from '@/lib/rateLimit';
import { authOptions } from '@/lib/auth';

// Validation schema for match preferences
const matchPreferencesSchema = z.object({
  maxDistance: z.number().min(1).max(100),
  minAge: z.number().min(18).max(100).optional(),
  maxAge: z.number().min(18).max(100).optional(),
  interests: z.array(z.string()).optional(),
  verifiedOnly: z.boolean().optional(),
  withPhoto: z.boolean().optional(),
  activityType: z.string().optional(),
  timeWindow: z.enum(['anytime', 'now', '15min', '30min', '1hour', 'today']).optional(),
  privacyMode: z.enum(['standard', 'strict']).optional(),
  useBluetoothProximity: z.boolean().optional(),
});

// GET /api/matches - Get potential matches
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const identifier = session.user.id;
    const isLimited = await rateLimit(identifier, 'get_matches');
    if (isLimited) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const preferences = {
      maxDistance: Number(searchParams.get('maxDistance')) || 10,
      minAge: Number(searchParams.get('minAge')) || undefined,
      maxAge: Number(searchParams.get('maxAge')) || undefined,
      interests: searchParams.get('interests')?.split(',') || undefined,
      verifiedOnly: searchParams.get('verifiedOnly') === 'true',
      withPhoto: searchParams.get('withPhoto') === 'true',
      activityType: searchParams.get('activityType') || undefined,
      timeWindow: searchParams.get('timeWindow') || undefined,
      privacyMode: searchParams.get('privacyMode') || undefined,
      useBluetoothProximity: searchParams.get('useBluetoothProximity') === 'true',
    };

    // Validate preferences
    const validatedPrefs = matchPreferencesSchema.parse(preferences);

    // Get matches
    const matchingService = MatchingService.getInstance();
    const matches = await matchingService.findMatches(
      session.user.id,
      validatedPrefs
    );

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error in GET /api/matches:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preferences', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/matches/preferences - Update match preferences
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedPrefs = matchPreferencesSchema.parse(body);

    // Update preferences
    const matchingService = MatchingService.getInstance();
    await matchingService.updatePreferences(
      session.user.id,
      validatedPrefs
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/matches/preferences:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid preferences', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
