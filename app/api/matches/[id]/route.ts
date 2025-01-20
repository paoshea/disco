import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { MatchingService } from '@/services/matching/match.service';
import { rateLimit } from '@/lib/rateLimit';
import { authOptions } from '@/lib/auth';

// Validation schema for match actions
const matchActionSchema = z.object({
  action: z.enum(['accept', 'decline', 'block', 'report']),
  reason: z.string().optional(), // Required for report action
});

// GET /api/matches/[id] - Get match details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const matchingService = MatchingService.getInstance();
    const status = await matchingService.getMatchStatus(
      session.user.id,
      params.id
    );

    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error in GET /api/matches/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/matches/[id] - Perform match action (accept/decline/block/report)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const isLimited = await rateLimit(identifier, 'match_action');
    if (isLimited) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { action, reason } = matchActionSchema.parse(body);

    // Check if reason is provided for report action
    if (action === 'report' && !reason) {
      return NextResponse.json(
        { error: 'Reason is required for report action' },
        { status: 400 }
      );
    }

    // Perform action
    const matchingService = MatchingService.getInstance();
    switch (action) {
      case 'accept':
        await matchingService.acceptMatch(session.user.id, params.id);
        break;
      case 'decline':
        await matchingService.rejectMatch(session.user.id, params.id);
        break;
      case 'block':
        await matchingService.blockMatch(session.user.id, params.id);
        break;
      case 'report':
        await matchingService.reportMatch(session.user.id, params.id, reason!);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/matches/[id]:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
