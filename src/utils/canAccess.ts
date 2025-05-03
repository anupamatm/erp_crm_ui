// src/utils/canAccess.ts
import { User } from '../lib/auth';

export const canAccess = (user: User | null, allowedRoles: User['role'][]): boolean => {
  return !!user && allowedRoles.includes(user.role);
};
