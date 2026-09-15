import type { UserRole } from '@/types';
export const DEMO_ADMIN_EMAIL = 'admin@practicekoro.com';
export const canRestoreCachedUser = (enabled: boolean) => enabled;
export const resolveDemoRole = (email: string): UserRole =>
  email.trim().toLowerCase() === DEMO_ADMIN_EMAIL ? 'admin' : 'student';
