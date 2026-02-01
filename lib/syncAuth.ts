import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { setSupabaseToken } from './supabase';
import { useSplash } from '@/hooks/useSplash';

/**
 * Type for Clerk's getToken function
 */
export type GetTokenFunction = (options?: { template?: string }) => Promise<string | null>;

/**
 * Refreshes the Supabase JWT by fetching a new token from Clerk
 * and binding it to the Supabase client.
 *
 * @param getToken - Clerk's getToken function from useAuth()
 * @returns The new token, or null if refresh failed
 */
export const refreshSupabaseJwt = async (getToken: GetTokenFunction): Promise<string | null> => {
  try {
    console.log('[SyncAuth] Refreshing Supabase JWT...');
    const token = await getToken({ template: 'supabase' });

    if (!token) {
      console.warn('[SyncAuth] Failed to refresh token: no token returned');
      return null;
    }

    setSupabaseToken(token);
    console.log('[SyncAuth] JWT refreshed and bound to Supabase');
    return token;
  } catch (error) {
    console.error('[SyncAuth] Error refreshing JWT:', error);
    return null;
  }
};

/**
 * Checks if a Supabase error is a JWT expiration error (PGRST303)
 *
 * @param error - The error object from a Supabase request
 * @returns true if the error is a JWT expiration error
 */
export const isJwtExpiredError = (error: any): boolean => {
  if (!error) return false;

  // Check for PGRST303 error code
  if (error.code === 'PGRST303') {
    return true;
  }

  // Check for "JWT expired" in message
  if (error.message && typeof error.message === 'string') {
    return error.message.toLowerCase().includes('jwt expired');
  }

  // Check for "JWT expired" in details
  if (error.details && typeof error.details === 'string') {
    return error.details.toLowerCase().includes('jwt expired');
  }

  return false;
};

export function SyncManager()
{
  useCloudSync();
  return null;
}


export function SplashManager()
{
  useSplash();
  return null;
}
