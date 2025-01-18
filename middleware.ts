import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

// Add paths that don't require authentication
const publicPaths = [
  '/login',
  '/signup',
  '/reset-password',
  '/verify-email',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
];

// Rate limit configuration
const RATE_LIMIT = {
  window: 60 * 1000, // 1 minute
  max: 100, // max requests per window
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without rate limiting
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Apply rate limiting to all routes
  const clientIp = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
                  
  const rateLimitKey = `ratelimit:${clientIp}:${pathname}`;
  
  // Get rate limit data from KV store or similar
  // This is a placeholder - implement your preferred rate limiting solution
  const rateLimitData = request.headers.get(rateLimitKey);
  if (rateLimitData) {
    const { count, timestamp } = JSON.parse(rateLimitData);
    if (
      Date.now() - timestamp < RATE_LIMIT.window &&
      count >= RATE_LIMIT.max
    ) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Handle authentication
  const accessToken = request.cookies.get('token')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // If no tokens present and not a public path, redirect to login
  if (!accessToken && !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If access token is present but expired, try to refresh
  if (accessToken) {
    try {
      // Verify the token
      verifyJWT(accessToken);
    } catch (error) {
      // Token is invalid or expired
      if (refreshToken) {
        try {
          // Call refresh token endpoint
          const response = await fetch(new URL('/api/auth/refresh', request.url), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            throw new Error('Failed to refresh token');
          }

          const data = await response.json();
          const response2 = NextResponse.next();

          // Set new access token
          response2.cookies.set('token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
          });

          return response2;
        } catch (error) {
          // If refresh fails, redirect to login
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('returnTo', pathname);
          return NextResponse.redirect(loginUrl);
        }
      } else {
        // No refresh token available, redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // For API routes that require auth
  if (pathname.startsWith('/api/') && !publicPaths.includes(pathname)) {
    if (!accessToken) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
      // Verify the token
      const decoded = verifyJWT(accessToken);
      
      // Add user info to request headers
      const headers = new Headers(request.headers);
      headers.set('X-User-Id', decoded.userId);
      headers.set('X-User-Email', decoded.email);

      // Clone the request with new headers
      const newRequest = new Request(request.url, {
        method: request.method,
        headers: headers,
        body: request.body,
      });

      return NextResponse.next({
        request: newRequest,
      });
    } catch (error) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
