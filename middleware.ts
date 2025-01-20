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

  // Get token from cookie
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const session = await verifyToken(token);

    if (!session) {
      return redirectToLogin(request);
    }

    // Check admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (session.user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return redirectToLogin(request);
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
