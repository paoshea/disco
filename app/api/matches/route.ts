import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { MatchingService } from '@/services/matching/match.service';
import { RateLimiter } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';
import type { UserPreferences } from '@/types/user';
import { authOptions } from '@/lib/auth';

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

const matchingService = MatchingService.getInstance();

// GET /api/matches - Get potential matches
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const matches = await matchingService.findMatches(session.user.id);
    return NextResponse.json(matches);
  } catch (error) {
    console.error('Error finding matches:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/matches/preferences - Update match preferences
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const preferences = await req.json() as UserPreferences;
    await matchingService.updatePreferences(session.user.id, preferences);
    return new NextResponse('Preferences updated', { status: 200 });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
