import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MatchingService } from '@/services/matching/match.service';
import { RateLimiter } from '@/lib/rateLimit';

// Rate limiter for match operations
const rateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 100
});

// GET /api/matches/[id] - Get specific match details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get match details
    const matchingService = MatchingService.getInstance();
    const match = await matchingService.getMatchStatus(session.user.id, id);

    return NextResponse.json({ match });
  } catch (error) {
    console.error('Error in GET /api/matches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/matches/[id] - Update match status (accept/reject/block)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const identifier = session.user.id;
    const limited = await rateLimiter.isRateLimited(identifier);
    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { action } = body;

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
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/matches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
