
import type { Permission, RolePermissions } from '@/types/permissions';
import type { UserRole } from '@/types/auth';

export const ROLES = {
  GUEST: 'guest',
  USER: 'user',
  POWER_USER: 'power_user',
  ADMIN: 'admin',
} as const;

export const DEFAULT_PERMISSIONS: RolePermissions = {
  GUEST: ['view:profiles'],
  USER: [
    'view:profiles',
    'send:messages',
    'join:events',
    'create:matches'
  ],
  POWER_USER: [
    'view:profiles',
    'send:messages',
    'join:events',
    'create:matches',
    'create:events',
    'access:safety',
    'manage:contacts'
  ],
  ADMIN: [
    'view:profiles',
    'send:messages',
    'join:events', 
    'create:matches',
    'create:events',
    'access:safety',
    'manage:contacts'
  ]
};

export const isValidRole = (role: string): role is UserRole => {
  return Object.values(ROLES).includes(role as UserRole);
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

