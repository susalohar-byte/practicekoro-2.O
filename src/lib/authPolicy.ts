/**
 * Auth policy — production configuration.
 *
 * Admin accounts are created exclusively through direct database operations,
 * never through the public registration UI.  The ADMIN_EMAILS list is used
 * server-side (inside Supabase RPC / resolveUserProfile) for auto-promotion;
 * it is NOT used as a client-side trust boundary.
 */

export const ADMIN_EMAILS = ['admin@practicekoro.com', 'admin@practicekoro.online'];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};
