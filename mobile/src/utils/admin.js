export const ADMIN_EMAILS = [
  'admin@bingmath.com',
  'bingsteam@gmail.com',
  'duomath.admin@gmail.com',
];

/**
 * Checks whether a user profile or Firebase user has Admin / Founder privileges
 * (Hermes bundle lines 274018–274074)
 */
export function isAdminAccount(profile, firebaseUser) {
  if (!profile && !firebaseUser) return false;
  if (
    profile?.is_admin === true ||
    profile?.is_admin === 1 ||
    profile?.role === 'admin'
  ) {
    return true;
  }
  const email = String(profile?.email || firebaseUser?.email || '')
    .trim()
    .toLowerCase();
  const username = String(profile?.username || '')
    .trim()
    .toLowerCase();
  if (email && ADMIN_EMAILS.includes(email)) return true;
  if (username === 'admin' || username === 'bingadmin') return true;
  return false;
}
