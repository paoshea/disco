
export type Permission = 
  | 'create:events'
  | 'join:events'
  | 'send:messages' 
  | 'create:matches'
  | 'view:profiles'
  | 'access:safety'
  | 'manage:contacts';

export type RolePermissions = {
  GUEST: Permission[];
  USER: Permission[];
  POWER_USER: Permission[];
  ADMIN: Permission[];
};

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
