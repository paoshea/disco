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

  // Check if path requires authentication
  const authPaths = [
    '/api/chats',
    '/api/events',
    '/api/location',
    '/api/dashboard',
    '/api/safety',
  ];
  const requiresAuth = authPaths.some(authPath =>
    pathname.startsWith(authPath)
  );
  const requiresAdmin = adminRoutes.some(adminPath =>
    pathname.startsWith(adminPath)
  );

  if (!requiresAuth && !requiresAdmin) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({ req: request });

    if (!token) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    // For admin routes, check role
    if (requiresAdmin && token.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ message: 'Admin access required' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
