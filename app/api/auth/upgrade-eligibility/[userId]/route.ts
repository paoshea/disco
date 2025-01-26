import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

  export const GET = async (
    request: NextRequest
  ) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: context.params.userId },
      include: {
        safetyChecks: true,
        matches: true,
        events: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const requirements = [];
    let eligible = true;

    // Check safety score
    if (user.safetyChecks.length < 5) {
      requirements.push('Complete at least 5 safety checks');
      eligible = false;
    }

    // Check successful matches
    if (user.matches.length < 3) {
      requirements.push('Complete at least 3 successful matches');
      eligible = false;
    }

    // Check event participation
    if (user.events.length < 2) {
      requirements.push('Participate in at least 2 events');
      eligible = false;
    }

    return NextResponse.json({ eligible, requirements });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check eligibility' },
      { status: 500 }
    );
  }
};