import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, type JWTPayload } from '@/lib/auth';

// Add paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/api/dashboard',
  '/api/auth/refresh',
  '/api/safety-check',
];

// Add paths that should redirect authenticated users
const authPaths = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get('auth-token');
  const isProtectedPath = protectedPaths.some(path =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));

  try {
    if (!authToken && isProtectedPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (authToken) {
      try {
        const decoded = await verifyToken(authToken.value);

        // Redirect authenticated users away from auth pages
        if (isAuthPath) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Add user info to headers for protected paths
        if (isProtectedPath) {
          const response = NextResponse.next();
          response.headers.set('X-User-Id', decoded.userId);
          response.headers.set('X-User-Email', decoded.email);
          response.headers.set('X-User-Role', decoded.role);
          return response;
        }
      } catch (error) {
        console.error('Token verification error:', error);

        // Handle token verification errors on protected paths
        if (isProtectedPath) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('returnTo', pathname);
          return NextResponse.redirect(loginUrl);
        }
      }
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

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
