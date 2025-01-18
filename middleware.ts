import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import type { JWTPayload } from '@/types/auth';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/refresh',
  '/api/auth/password-reset/request',
  '/api/auth/password-reset/verify',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from header
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Add user info to headers
  const requestHeaders = new Headers(request.headers);
  if (payload.userId) {
    requestHeaders.set('x-user-id', payload.userId);
  }
  if (payload.email) {
    requestHeaders.set('x-user-email', payload.email);
  }
  if (payload.role) {
    requestHeaders.set('x-user-role', payload.role);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
