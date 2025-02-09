import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/types/permissions';
import type { ReactNode } from 'react';

interface PermissionGateProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGate = ({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) => {
  const hasPermission = usePermissions(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
