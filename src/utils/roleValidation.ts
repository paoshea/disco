
export const ROLES = {
  GUEST: 'guest',
  POWER_USER: 'power_user',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

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
