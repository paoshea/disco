import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { MatchingService } from '@/services/matching/match.service';
import { RateLimiter } from '@/lib/rateLimit';
import { prisma } from '@/lib/db/client';
import type { UserPreferences } from '@/types/user';
import { authOptions } from '@/lib/auth';
import { AppLocationPrivacyMode } from '@/types/location';

// Configuration
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Rate limiter for match operations
const rateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
});

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
  activityTypes: z.array(z.string()),
  availability: z.array(z.string()),
  interests: z.array(z.string()),
  verifiedOnly: z.boolean(),
  withPhoto: z.boolean(),
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
  timeWindow: z.string().optional(),
  useBluetoothProximity: z.boolean().optional(),
  privacyMode: z.nativeEnum(AppLocationPrivacyMode).optional(),
});

const matchingService = MatchingService.getInstance();

// GET /api/matches - Get potential matches
export async function GET(
  req: NextRequest
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const matches = await matchingService.findMatches(session.user.id);
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error finding matches:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/matches/preferences - Update match preferences
export async function POST(
  req: NextRequest
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rawBody = await req.json();
    const result = userPreferencesSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    const preferences = result.data;
    const userId = session.user.id;

    try {
      const timeWindow = preferences.timeWindow || 'anytime';
      if (!['anytime', 'today', 'thisWeek', 'thisMonth'].includes(timeWindow)) {
        return NextResponse.json(
          { error: 'Invalid timeWindow value' },
          { status: 400 }
        );
      }

      await matchingService.updatePreferences(userId, {
        ...preferences,
        privacyMode: preferences.privacyMode || AppLocationPrivacyMode.PUBLIC,
        timeWindow: timeWindow as 'anytime' | 'today' | 'thisWeek' | 'thisMonth',
        useBluetoothProximity: preferences.useBluetoothProximity ?? false,
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating preferences:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
