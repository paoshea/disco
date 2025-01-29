export type RolePermissions = {
  [role: string]: string[];
};

export const DEFAULT_PERMISSIONS: RolePermissions = {
  user: ['read'],
  admin: ['read', 'write', 'delete'],
  // Add other roles and their permissions as needed
};
