import type { UserRole } from '@/types';

export const ADMIN_EMAILS = ['admin@practicekoro.com', 'admin@practicekoro.online'];

export const DEMO_ADMIN_EMAIL = 'admin@practicekoro.com';

export const canRestoreCachedUser = (enabled: boolean) => enabled;

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

export const resolveDemoRole = (email: string): UserRole =>
  isAdminEmail(email) ? 'admin' : 'student';
