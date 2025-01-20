import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser;
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    const session = await verifyToken(token);

    if (!session) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Add user info to the request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    } as AuthenticatedUser;

    return handler(authenticatedRequest);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
