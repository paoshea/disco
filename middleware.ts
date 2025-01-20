import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/',
  '/features',
  '/pricing',
  '/chat',
  '/security',
  '/about',
  '/blog',
  '/careers',
  '/privacy',
  '/terms',
  '/contact',
];

// Routes that require admin role
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for API routes that don't need auth
  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/signup') ||
    pathname.startsWith('/api/auth/refresh') ||
    pathname.startsWith('/api/auth/password-reset') ||
    pathname.startsWith('/api/auth/verify-email')
  ) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    // Verify token and get session
    const session = await verifyToken(token);

    if (!session?.user) {
      return redirectToLogin(request);
    }

    // Check admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (session.user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
      }
    }

    // Add user info to headers for route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.user.id);
    
    if (session.user.email) {
      requestHeaders.set('x-user-email', session.user.email);
    }
    
    if (session.user.role) {
      requestHeaders.set('x-user-role', session.user.role);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = `?from=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /static/* (static files)
     * 4. /*.* (files with extensions)
     */
    '/((?!api/auth|_next|static|[\\w-]+\\.\\w+).*)',
  ],
};
