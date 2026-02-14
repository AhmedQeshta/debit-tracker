import { hasSupabaseToken, supabase } from '@/lib/supabase';
import { GetTokenFunction, isJwtExpiredError, retryOnceOnJwtExpired } from '@/services/authSync';
import { useSyncStore } from '@/store/syncStore';

/**
 * Timeout wrapper for network calls (5 seconds for ensureAppUser)
 */
const ENSURE_USER_TIMEOUT_MS = 15000;

const withTimeout = <T>(promise: Promise<T>, ms: number = ENSURE_USER_TIMEOUT_MS): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Network timeout after ${ms}ms`)), ms),
    ),
  ]);
};

/**
 * Ensures an app_user record exists in Supabase for the given Clerk user.
 * Upserts based on clerk_id and returns the app_user UUID.
 *
 * @param clerkUser - The Clerk user object
 * @param getToken - Clerk's getToken function
 * @returns Object with ok status and optional appUser data
 */
export const ensureAppUser = async (
  clerkUser: any,
  getToken: GetTokenFunction,
): Promise<{ ok: boolean; skipped?: boolean; reason?: string; appUser?: { id: string } }> => {
  const { syncEnabled, isSigningOut } = useSyncStore.getState();

  // STRICT GATING: if sync is disabled, or no token, or no user -> skip
  if (!syncEnabled || isSigningOut || !hasSupabaseToken() || !clerkUser) {
    return {
      ok: false,
      skipped: true,
      reason: !syncEnabled
        ? 'sync_disabled'
        : isSigningOut
          ? 'signing_out'
          : !hasSupabaseToken()
            ? 'no_token'
            : 'no_user',
    };
  }

  if (process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
    return { ok: false, skipped: true, reason: 'placeholder_config' };
  }

  try {
    // Helper to execute with retry and timeout
    const executeWithRetry = async <T>(queryFn: () => Promise<T>): Promise<T> => {
      return withTimeout(retryOnceOnJwtExpired(queryFn, getToken), ENSURE_USER_TIMEOUT_MS);
    };

    // Query for existing record ONLY by clerk_id (with timeout)
    const { data: existing, error: queryError } = await executeWithRetry(
      async () =>
        await supabase.from('app_users').select('id').eq('clerk_id', clerkUser.id).maybeSingle(),
    );

    if (queryError && !isJwtExpiredError(queryError)) {
      if (!useSyncStore.getState().isSigningOut) {
        console.error('[UserService] Error querying app_users:', queryError);
      }
      throw queryError;
    }

    const latestState = useSyncStore.getState();
    if (!latestState.syncEnabled || latestState.isSigningOut || !hasSupabaseToken()) {
      return { ok: false, skipped: true, reason: 'signing_out' };
    }

    // Build upsert payload
    const upsertData: any = {
      clerk_id: clerkUser.id, // TEXT column
      email: clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddress || null,
      name: clerkUser.fullName || clerkUser.firstName || null,
      updated_at: new Date().toISOString(),
    };

    // If record exists, include the existing UUID for update
    // IMPORTANT: never use clerkUser.id here
    if (existing?.id) {
      upsertData.id = existing.id;
    }

    // Upsert with timeout
    const { data: upserted, error: upsertError } = await executeWithRetry(
      async () =>
        await supabase
          .from('app_users')
          .upsert(upsertData, { onConflict: 'clerk_id' })
          .select()
          .single(),
    );

    if (upsertError) {
      if (!useSyncStore.getState().isSigningOut) {
        console.error('[UserService] Error ensuring user record:', upsertError);
      }
      // If JWT expired and retry failed, set sync status
      if (isJwtExpiredError(upsertError)) {
        useSyncStore.getState().setSyncStatus('needs_login');
      }
      throw upsertError;
    }

    if (!upserted || !upserted.id) {
      throw new Error('Failed to create or retrieve app_user record');
    }

    // Store cloudUserId in syncStore
    useSyncStore.getState().setCloudUserId(upserted.id);

    return {
      ok: true,
      appUser: { id: upserted.id },
    };
  } catch (error: any) {
    // Check for timeout error
    if (error?.message?.includes('timeout') || error?.message?.includes('Network timeout')) {
      console.warn('[UserService] ensureAppUser timed out after 5s (likely offline)');
      throw new Error('Network timeout. Check your connection and retry.');
    }

    if (!useSyncStore.getState().isSigningOut) {
      console.error('[UserService] ensureAppUser error:', error);
    }
    // If JWT expired and retry failed, set sync status
    if (isJwtExpiredError(error)) {
      useSyncStore.getState().setSyncStatus('needs_login');
    }
    throw error;
  }
};
