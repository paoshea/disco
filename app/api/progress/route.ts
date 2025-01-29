import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { progressService } from '@/services/user/progress.service';
import { getServerAuthSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progress = await progressService.trackUserProgress(session.user.id);
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
