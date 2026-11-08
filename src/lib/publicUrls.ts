export const PUBLIC_SITE_URL = 'https://nokkhotro-hsc-2028.vercel.app';
export const PRIVACY_POLICY_URL = `${PUBLIC_SITE_URL}/privacy`;
export const ACCOUNT_DELETION_URL = `${PUBLIC_SITE_URL}/account-deletion`;
export const PRIVACY_CONTACT_EMAIL = 'abn21.noman@gmail.com';

export type PublicRoute = 'privacy' | 'account-deletion';

/** Public clean paths render before the authentication gate. */
export function getPublicRoute(pathname: string): PublicRoute | null {
  const normalized = ('/' + (pathname || '').replace(/^\/+|\/+$/g, '')).toLowerCase();
  if (normalized === '/privacy') return 'privacy';
  if (normalized === '/account-deletion') return 'account-deletion';
  return null;
}
