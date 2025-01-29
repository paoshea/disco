import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (user.safetyChecks.length < 5) {
    requirements.push('Complete at least 5 safety checks');
  }

  if (user.matches.length < 3) {
    requirements.push('Have at least 3 matches');
  }

  if (user.events.length < 2) {
    requirements.push('Participate in at least 2 events');
  }

  const eligible = requirements.length === 0;

  return NextResponse.json({ eligible, requirements });
}
