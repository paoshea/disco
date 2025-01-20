import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';

interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string;
  };
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>,
  req: NextRequest
): Promise<Response> {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add user info to the request
    const authenticatedRequest = req as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      firstName: session.user.firstName,
    };

    return handler(authenticatedRequest);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
