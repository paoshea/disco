import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { MatchingService } from '@/services/matching/match.service';
import { isRateLimited } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';

// Rate limiter for match operations
const rateLimiterConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
};

// Validation schema for user preferences
const userPreferencesSchema = z.object({
  maxDistance: z.number().min(0).max(100),
  ageRange: z.object({
    min: z.number().min(18).max(100),
    max: z.number().min(18).max(100),
  }),
  gender: z.array(z.string()),
  lookingFor: z.array(z.string()),
  relationshipType: z.array(z.string()),
  interests: z.array(z.string()),
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
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user.id;
    const isLimited = await isRateLimited(identifier, 'match-action');
    if (isLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const validatedPreferences = userPreferencesSchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!validatedPreferences.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      );
    }

    // Get matches
    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        locations: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const matchingService = MatchingService.getInstance();
    // Update user preferences before finding matches
    await matchingService.setPreferences(userId, validatedPreferences.data);
    const matches = await matchingService.findMatches(userId);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error in GET /api/matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/matches/preferences - Update match preferences
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const isLimited = await isRateLimited(session.user.id, 'match-action');
    if (isLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Parse and validate request body
    const rawBody = (await req.json()) as unknown;
    const result = userPreferencesSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid preferences' },
        { status: 400 }
      );
    }

    const preferences = result.data;

    // Update preferences
    const matchingService = MatchingService.getInstance();
    await matchingService.setPreferences(session.user.id, preferences);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/matches/preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
