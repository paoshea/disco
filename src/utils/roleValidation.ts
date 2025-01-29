import type { Permission } from '@/types/permissions';
import { ROLES } from '../config/roles';

export type UserRole = keyof typeof ROLES;

export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  GUEST: ['view:profiles'],
  USER: ['view:profiles', 'send:messages', 'join:events', 'create:matches'],
  POWER_USER: [
    'view:profiles',
    'send:messages',
    'join:events',
    'create:matches',
    'create:events',
    'access:safety',
    'manage:contacts',
  ],
  ADMIN: [
    'view:profiles',
    'send:messages',
    'join:events',
    'create:matches',
    'create:events',
    'access:safety',
    'manage:contacts',
    'manage:users',
    'manage:roles',
  ],
};

export const isValidRole = (role: string): role is UserRole => {
  return (Object.values(ROLES) as string[]).includes(role);
};

export const canUpgrade = (currentRole: UserRole): boolean => {
  switch (currentRole) {
    case ROLES.GUEST:
      return true;
    case ROLES.POWER_USER:
    case ROLES.ADMIN:
      return false;
    default:
      return false;
  }
};
