import { NextResponse, type NextRequest } from 'next/server';
import { getSession, verifyToken } from '@/lib/auth';

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const session = await getSession(request);
    const token = request.cookies.get('accessToken')?.value;

    if (!session || !token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Validate token expiration
    try {
      const decoded = await verifyToken(token);
      if (!decoded) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
      }
    } catch (error) {
      return NextResponse.json(
        { message: 'Token validation failed' },
        { status: 401 }
      );
    }

    return handler(request);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
