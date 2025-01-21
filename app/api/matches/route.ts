import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { MatchingService } from '@/services/matching/match.service';
import { RateLimiter } from '@/lib/rateLimit';
import type { UserPreferences } from '@/types/user';

const rateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
});

// Base preferences schema matching UserPreferences type
const matchPreferencesSchema = z.object({
  ageRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  maxDistance: z.number().min(0).max(100),
  interests: z.array(z.string()),
  gender: z.array(z.string()),
  lookingFor: z.array(z.string()),
  relationshipType: z.array(z.string()),
  notifications: z.object({
    matches: z.boolean(),
    messages: z.boolean(),
    events: z.boolean(),
    safety: z.boolean(),
  }),
  privacy: z.object({
    showOnlineStatus: z.boolean(),
    showLastSeen: z.boolean(),
    showLocation: z.boolean(),
    showAge: z.boolean(),
  }),
  safety: z.object({
    requireVerifiedMatch: z.boolean(),
    meetupCheckins: z.boolean(),
    emergencyContactAlerts: z.boolean(),
  }),
});

// GET /api/matches - Get potential matches
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user.id;
    const isLimited = await rateLimiter.isRateLimited(identifier);
    if (isLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const preferences: UserPreferences = {
      maxDistance: Number(searchParams.get('maxDistance')) || 10,
      ageRange: {
        min: Number(searchParams.get('minAge')) || 18,
        max: Number(searchParams.get('maxAge')) || 100,
      },
      interests:
        searchParams.get('interests')?.split(',').filter(Boolean) || [],
      gender: searchParams.get('gender')?.split(',').filter(Boolean) || ['any'],
      lookingFor: searchParams
        .get('lookingFor')
        ?.split(',')
        .filter(Boolean) || ['any'],
      relationshipType: searchParams
        .get('relationshipType')
        ?.split(',')
        .filter(Boolean) || ['any'],
      notifications: {
        matches: true,
        messages: true,
        events: true,
        safety: true,
      },
      privacy: {
        showOnlineStatus: true,
        showLastSeen: true,
        showLocation: true,
        showAge: true,
      },
      safety: {
        requireVerifiedMatch: false,
        meetupCheckins: true,
        emergencyContactAlerts: true,
      },
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
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedPrefs = matchPreferencesSchema.parse(body);

    // Update preferences
    const matchingService = MatchingService.getInstance();
    await matchingService.setPreferences(session.user.id, validatedPrefs);

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
