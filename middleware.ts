import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

// Specify that this middleware should run in the Node.js runtime
export const runtime = 'nodejs';

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

  // Get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  // No token found
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    return redirectToLogin(request);
  }

  try {
    // Verify token
    const payload = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!payload) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }
      return redirectToLogin(request);
    }

    // Check admin routes
    if (
      adminRoutes.some(route => pathname.startsWith(route)) &&
      payload.role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/403', request.url));
    }

    // Public paths that don't require auth
    const publicPaths = [
      '/',
      '/login',
      '/signup',
      '/verify-email',
      '/forgot-password',
    ];
    const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

    // Protected paths that require auth
    const protectedPaths = ['/dashboard', '/profile', '/settings'];
    const isProtectedPath = protectedPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    );

    // Redirect to login if accessing protected path without auth
    if (isProtectedPath && !token) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      return response;
    }

    // Redirect to dashboard if accessing auth pages while logged in
    if (isPublicPath && token) {
      const response = NextResponse.redirect(
        new URL('/dashboard', request.url)
      );
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: 401 }
      );
    }
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
     * 3. /_static/* (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!_next/|_static/|favicon.ico|sitemap.xml).*)',
  ],
};
