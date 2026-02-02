import { supabase, hasSupabaseToken } from '@/lib/supabase';
import { useSyncStore } from '@/store/syncStore';
import { retryOnceOnJwtExpired, isJwtExpiredError, GetTokenFunction } from '@/services/authSync';

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
): Promise<{ ok: boolean; skipped?: boolean; reason?: string; appUser?: { id: string } }> =>
{
  const { syncEnabled } = useSyncStore.getState();

  // STRICT GATING: if sync is disabled, or no token, or no user -> skip
  if (!syncEnabled || !hasSupabaseToken() || !clerkUser)
  {
    console.log('[UserService] ensureAppUser skipped:', {
      syncEnabled,
      hasToken: hasSupabaseToken(),
      hasUser: !!clerkUser,
    });
    return {
      ok: false,
      skipped: true,
      reason: !syncEnabled ? 'sync_disabled' : !hasSupabaseToken() ? 'no_token' : 'no_user',
    };
  }

  if (process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder'))
  {
    console.log('[UserService] Sync skipped: Placeholder configuration');
    return { ok: false, skipped: true, reason: 'placeholder_config' };
  }

  try
  {
    // Helper to execute with retry
    const executeWithRetry = async <T>(queryFn: () => Promise<T>): Promise<T> =>
    {
      return retryOnceOnJwtExpired(queryFn, getToken);
    };

    // Query for existing record ONLY by clerk_id
    const { data: existing, error: queryError } = await executeWithRetry(
      async () =>
        await supabase.from('app_users').select('id').eq('clerk_id', clerkUser.id).maybeSingle(),
    );

    if (queryError && !isJwtExpiredError(queryError))
    {
      console.error('[UserService] Error querying app_users:', queryError);
      throw queryError;
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
    if (existing?.id)
    {
      upsertData.id = existing.id;
    }

    console.log('[UserService] ensureAppUser payload:', upsertData);

    const { data: upserted, error: upsertError } = await executeWithRetry(
      async () =>
        await supabase.from('app_users').upsert(upsertData, { onConflict: 'clerk_id' }).select().single(),
    );

    if (upsertError)
    {
      console.error('[UserService] Error ensuring user record:', upsertError);
      // If JWT expired and retry failed, set sync status
      if (isJwtExpiredError(upsertError))
      {
        useSyncStore.getState().setSyncStatus('needs_login');
      }
      throw upsertError;
    }

    if (!upserted || !upserted.id)
    {
      throw new Error('Failed to create or retrieve app_user record');
    }

    // Store cloudUserId in syncStore
    useSyncStore.getState().setCloudUserId(upserted.id);
    console.log('[UserService] app_user ensured, cloudUserId stored:', upserted.id);

    return {
      ok: true,
      appUser: { id: upserted.id },
    };
  } catch (error: any)
  {
    console.error('[UserService] ensureAppUser error:', error);
    // If JWT expired and retry failed, set sync status
    if (isJwtExpiredError(error))
    {
      useSyncStore.getState().setSyncStatus('needs_login');
    }
    throw error;
  }
};

