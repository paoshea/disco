
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';

export async function roleGuard(request: NextRequest, allowedRoles: string[]) {
  const session = await getServerAuthSession(request);

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}
