import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Add paths that require authentication
const protectedPaths = ['/dashboard', '/api/dashboard', '/api/auth/refresh', '/api/safety-check'];

// Add paths that should redirect authenticated users
const authPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth-token');
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname === path);

  // Handle unauthenticated requests
  if (!authToken?.value) {
    if (isProtectedPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    // Verify token
    const decoded = await verifyToken(authToken.value);

    // Handle invalid token
    if (!decoded && isProtectedPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if (decoded && isAuthPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Add user info to headers for protected paths
    if (decoded && isProtectedPath) {
      const response = NextResponse.next();
      response.headers.set('X-User-Id', decoded.userId);
      response.headers.set('X-User-Email', decoded.email);
      return response;
    }

    // Default case: allow request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Handle errors on protected paths
    if (isProtectedPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Allow request to proceed for non-protected paths
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes that don't need token verification)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
