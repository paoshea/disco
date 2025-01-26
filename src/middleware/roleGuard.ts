
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_PERMISSIONS } from '@/types/permissions';
import type { Permission } from '@/types/permissions';

export function withRoleGuard(handler: Function, requiredPermission: Permission) {
  return async (request: NextRequest) => {
    try {
      const session = request.headers.get('authorization');
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get user role from session/token
      const userRole = 'USER'; // Replace with actual role from session

      // Check if user's role has the required permission
      const rolePermissions = DEFAULT_PERMISSIONS[userRole];
      if (!rolePermissions.includes(requiredPermission)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return handler(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
