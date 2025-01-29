import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_PERMISSIONS, RolePermissions } from '@/config/permissions';

export function usePermissions(permission: string): boolean {
  const { user } = useAuth();

  if (!user?.role) return false;

  return DEFAULT_PERMISSIONS[user.role as keyof RolePermissions].includes(permission);
}
