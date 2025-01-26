import React from 'react';
import { NextResponse } from 'next/server';
import { useSession } from 'next-auth/react';
import type { NextRequest } from 'next/server';
import { DEFAULT_PERMISSIONS, ROLES } from '@/utils/roleValidation';
import type { Permission } from '@/types/permissions';
import { getServerAuthSession } from '@/lib/auth';

export async function withRoleGuard(handler: Function, requiredPermission: Permission) {
  return async (request: NextRequest) => {
    try {
      const session = await getServerAuthSession(request);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const userRole = (session.user.role || ROLES.GUEST) as keyof typeof ROLES;
      const rolePermissions = DEFAULT_PERMISSIONS[userRole];

      if (!rolePermissions.includes(requiredPermission)) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          requiredPermission,
          currentRole: userRole
        }, { status: 403 });
      }

      // Track progression metrics
      await fetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify({
          userId: session.user.id,
          action: 'feature_access',
          permission: requiredPermission
        })
      }).catch(() => {}); // Non-blocking progress tracking

      return handler(request);
    } catch (error) {
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

export function useRoleGuard(Component: React.ComponentType, requiredPermission: Permission) {
  return function ProtectedComponent(props: any) {
    const session = useSession();
    const router = useRouter();

    if (!session?.user) {
      router.push('/login');
      return null;
    }

    const userRole = (session.user.role || ROLES.GUEST) as keyof typeof ROLES;
    const rolePermissions = DEFAULT_PERMISSIONS[userRole];

    if (!rolePermissions.includes(requiredPermission)) {
      return (
        React.createElement('div', { className: 'p-4 text-center' },
          React.createElement('h3', { className: 'text-lg font-semibold' }, 'Insufficient Permissions'),
          React.createElement('p', null, 'You need to upgrade your role to access this feature.'),
          React.createElement(RoleUpgrade, null)
        )
      );
    }

    return React.createElement(Component, props);
  };
}