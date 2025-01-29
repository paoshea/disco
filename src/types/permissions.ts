export type Permission =
  | 'view:profiles'
  | 'send:messages'
  | 'join:events'
  | 'create:matches'
  | 'create:events'
  | 'access:safety'
  | 'manage:contacts'
  | 'manage:users'
  | 'manage:roles';

export type RolePermissions = {
  GUEST: Permission[];
  USER: Permission[];
  POWER_USER: Permission[];
  ADMIN: Permission[];
};

export const DEFAULT_PERMISSIONS: RolePermissions = {
  GUEST: ['view:profiles'],
  USER: ['view:profiles', 'send:messages', 'join:events', 'create:matches', 'access:safety','manage:contacts'],
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
  ],
};
