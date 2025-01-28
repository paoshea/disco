import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_PERMISSIONS } from '@/types/permissions';
import type { Permission } from '@/types/permissions';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user?.role) return false;
    return DEFAULT_PERMISSIONS[user.role].includes(permission);
  };

  return {
    hasPermission,
  };
}
