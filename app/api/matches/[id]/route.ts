import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MatchingService } from '@/services/matching/match.service';
import { RateLimiter } from '@/lib/rateLimit';
import { z } from 'zod';

// Configuration
export const dynamic = 'force-dynamic'; // Disable static optimization
export const runtime = 'nodejs'; // Use Node.js runtime

// Types
type RouteContext = {
  params: Promise<Record<string, string>>;
};

// Validation schema
const matchActionSchema = z.object({
  action: z.enum(['accept', 'reject', 'block'])
});

// Rate limiter for match operations
const rateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100,
});

// GET /api/matches/[id] - Get specific match details
export async function GET(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { id } = params;

    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get match details
    const matchingService = MatchingService.getInstance();
    const match = await matchingService.getMatchStatus(session.user.id, id);

    return NextResponse.json({ match });
  } catch (error) {
    console.error('Error getting match:', error);
    return NextResponse.json({ error: 'Failed to get match' }, { status: 500 });
  }
}

// POST /api/matches/[id] - Update match status (accept/reject/block)
export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const params = await context.params;
    const { id } = params;

    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const isLimited = await rateLimiter.isRateLimited(session.user.id);
    if (isLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Parse and validate request body
    const body = await req.json();
    const result = matchActionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { action } = result.data;

    // Update match status
    const matchingService = MatchingService.getInstance();

    switch (action) {
      case 'accept':
        await matchingService.acceptMatch(session.user.id, id);
        break;
      case 'reject':
        await matchingService.rejectMatch(session.user.id, id);
        break;
      case 'block':
        await matchingService.blockMatch(session.user.id, id);
        break;
    }

    // Get updated match status
    const status = await matchingService.getMatchStatus(session.user.id, id);
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    );
  }
}
