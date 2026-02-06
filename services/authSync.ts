import { clearSupabaseToken, setSupabaseToken } from '@/lib/supabase';

/**
 * Type for Clerk's getToken function
 */
export type GetTokenFunction = (options?: { template?: string }) => Promise<string | null>;

/**
 * Result type for getFreshSupabaseJwt
 */
export type JwtFetchResult = {
  token: string | null;
  error?: 'template_missing' | 'other' | 'timeout';
};

/**
 * Timeout wrapper for network calls (5 seconds for token fetch)
 */
const TOKEN_FETCH_TIMEOUT_MS = 5000;

const withTimeout = <T>(promise: Promise<T>, ms: number = TOKEN_FETCH_TIMEOUT_MS): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Network timeout after ${ms}ms`)), ms),
    ),
  ]);
};

/**
 * Checks if an error is a Clerk JWT template missing error
 */
const isTemplateMissingError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message || error.toString() || '';
  const errorStr = String(errorMessage).toLowerCase();

  return (
    errorStr.includes('no jwt template') ||
    (errorStr.includes('jwt template') && errorStr.includes('not exist')) ||
    (errorStr.includes('jwt template') && errorStr.includes('does not exist')) ||
    (errorStr.includes('template') && errorStr.includes('not found'))
  );
};

/**
 * Gets a fresh Supabase JWT token from Clerk using the 'supabase' template
 * and binds it to the Supabase client.
 *
 * @param getToken - Clerk's getToken function from useAuth()
 * @returns Result object with token and optional error type
 */
export const getFreshSupabaseJwt = async (getToken: GetTokenFunction): Promise<JwtFetchResult> => {
  try {
    console.log('[AuthSync] Fetching Supabase JWT from Clerk...');
    // Wrap token fetch with 5s timeout
    const token = await withTimeout(getToken({ template: 'supabase' }), TOKEN_FETCH_TIMEOUT_MS);

    if (!token) {
      console.warn('[AuthSync] Failed to get token: no token returned');
      return { token: null, error: 'other' };
    }

    setSupabaseToken(token);
    console.log('[AuthSync] JWT fetched and bound to Supabase');
    return { token };
  } catch (error: any) {
    // Check for timeout error
    if (error?.message?.includes('timeout') || error?.message?.includes('Network timeout')) {
      console.warn('[AuthSync] Token fetch timed out after 5s (likely offline)');
      return { token: null, error: 'timeout' };
    }

    if (isTemplateMissingError(error)) {
      const devMessage =
        "[AuthSync] JWT template 'supabase' not found. " +
        'Create it in Clerk Dashboard → JWT Templates → Create Template ' +
        "(name: 'supabase', claims: sub={{user.id}}, email={{user.primary_email_address}}). " +
        'Make sure the template exists in the same environment (dev/prod) as your app.';
      console.error(devMessage);
      return { token: null, error: 'template_missing' };
    }

    console.error('[AuthSync] Error fetching JWT:', error);
    return { token: null, error: 'other' };
  }
};

/**
 * Checks if a Supabase error is a JWT expiration or authentication error
 * (PGRST303, 401, 403, or "JWT expired" messages)
 *
 * @param error - The error object from a Supabase request
 * @returns true if the error is a JWT expiration/authentication error
 */
export const isJwtExpiredError = (error: any): boolean => {
  if (!error) return false;

  // Check for HTTP status codes (401 Unauthorized, 403 Forbidden)
  if (error.status === 401 || error.status === 403) {
    return true;
  }

  // Check for PGRST303 error code (Supabase PostgREST JWT expired)
  if (error.code === 'PGRST303') {
    return true;
  }

  // Check for "JWT expired" in message
  if (error.message && typeof error.message === 'string') {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('jwt expired') ||
      msg.includes('token expired') ||
      msg.includes('unauthorized')
    ) {
      return true;
    }
  }

  // Check for "JWT expired" in details
  if (error.details && typeof error.details === 'string') {
    const details = error.details.toLowerCase();
    if (details.includes('jwt expired') || details.includes('token expired')) {
      return true;
    }
  }

  return false;
};

/**
 * Retries a function once if it fails with a JWT expiration error.
 * Clears the old token, refreshes it, and retries the operation.
 *
 * @param fn - The function to execute (should return a Promise)
 * @param getToken - Clerk's getToken function
 * @returns The result of the function call
 */
export const retryOnceOnJwtExpired = async <T>(
  fn: () => Promise<T>,
  getToken: GetTokenFunction,
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (isJwtExpiredError(error)) {
      console.warn('[AuthSync] JWT expired, clearing token and refreshing...');

      // Clear the expired token before refreshing
      clearSupabaseToken();

      const result = await getFreshSupabaseJwt(getToken);

      if (result.token) {
        console.warn('[AuthSync] Token refreshed, retrying operation...');
        try {
          return await fn();
        } catch (retryError: any) {
          console.error('[AuthSync] Retry operation failed:', retryError);
          throw retryError;
        }
      } else {
        console.error('[AuthSync] Failed to refresh token, cannot retry');
        throw error;
      }
    }
    throw error;
  }
};
