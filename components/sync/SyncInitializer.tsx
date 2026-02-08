import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { clearSupabaseToken, hasSupabaseToken, setSupabaseToken } from '@/lib/supabase';
import { getFreshSupabaseJwt } from '@/services/authSync';
import { ensureAppUser } from '@/services/userService';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Singleton component that handles all global sync side effects.
 * - Monitors network state
 * - Handles user auth state changes (login/logout)
 * - Manages Supabase token binding
 * - Triggers auto-sync when conditions are met
 */
export const SyncInitializer = () => {
  const { syncEnabled, setSyncEnabled, syncNow, pullAllDataForNewDevice, isNewDevice, isOnline } =
    useCloudSync();
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();

  const tokenBoundRef = useRef(false);
  const initInProgressRef = useRef(false);
  const lastAutoSyncRef = useRef<{ userId: string | null; syncEnabled: boolean }>({
    userId: null,
    syncEnabled: false,
  });
  const previousUserIdRef = useRef<string | null>(null);
  const syncAutoEnabledRef = useRef(false);

  // Helper to clear all local data
  const clearAllLocalData = useCallback(() => {
    console.log('[Sync] Clearing all local data for user switch');
    useFriendsStore.getState().setFriends([]);
    useTransactionsStore.getState().setTransactions([]);
    useBudgetStore.getState().setBudgets([]);
    useSyncStore.getState().setHasHydratedFromCloud(false);
    useSyncStore.getState().setLastPullAt(null);
  }, []);

  // Detect user switching and clear local data
  useEffect(() => {
    if (!isLoaded) return;

    const currentUserId = userId || null;
    const previousUserId = previousUserIdRef.current;

    // User switched (different user logged in)
    if (previousUserId !== null && currentUserId !== null && previousUserId !== currentUserId) {
      console.log('[Sync] User switch detected, clearing local data');
      clearSupabaseToken();
      tokenBoundRef.current = false;
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null);
      clearAllLocalData();
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
      syncAutoEnabledRef.current = false;
    }

    // User logged out
    if (previousUserId !== null && currentUserId === null) {
      console.log('[Sync] User logged out, clearing local data');
      clearSupabaseToken();
      tokenBoundRef.current = false;
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null);
      clearAllLocalData();
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
      syncAutoEnabledRef.current = false;
    }

    previousUserIdRef.current = currentUserId;
  }, [isLoaded, userId, clearAllLocalData]);

  // Enable sync by default when online + logged in
  useEffect(() => {
    if (!isLoaded) return;

    // Auto-enable sync when conditions are met (only once per session)
    if (isSignedIn && isOnline && !syncAutoEnabledRef.current && !syncEnabled) {
      console.log('[Sync] Auto-enabling sync (online + logged in)');
      setSyncEnabled(true);
      syncAutoEnabledRef.current = true;
    }

    // Reset auto-enable flag when user logs out or goes offline
    if (!isSignedIn || !isOnline) {
      syncAutoEnabledRef.current = false;
    }
  }, [isLoaded, isSignedIn, syncEnabled, setSyncEnabled]);

  // Clear token and cloudUserId when logged out or sync disabled
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !syncEnabled) {
      clearSupabaseToken();
      tokenBoundRef.current = false;
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null);
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
    }
  }, [isLoaded, isSignedIn, syncEnabled]);

  // Bind token and ensure user record
  useEffect(() => {
    if (initInProgressRef.current) return;

    const initUser = async () => {
      // Step 1: STRICT CHECK - If sync disabled -> return
      if (!syncEnabled) {
        setSupabaseToken(null);
        tokenBoundRef.current = false;
        initInProgressRef.current = false;
        return;
      }

      if (!isSignedIn || !isLoaded || !user || !userId) {
        initInProgressRef.current = false;
        return;
      }

      // If token already bound in global Supabase client, skip fetching
      if (hasSupabaseToken()) {
        tokenBoundRef.current = true;
        initInProgressRef.current = false;

        // Ensure user record if online
        if (isOnline) {
          try {
            await ensureAppUser(user, getToken);
            // if (result.ok) console.log('[Sync] App user ensured');
          } catch (e) {
            console.error('[Sync] Failed to ensure app user:', e);
          }
        }
        return;
      }

      if (!isOnline) {
        initInProgressRef.current = false;
        return;
      }

      // Fetch token
      try {
        const result = await getFreshSupabaseJwt(getToken);

        if (result.error === 'template_missing') {
          useSyncStore.getState().setSyncStatus('needs_config');
          initInProgressRef.current = false;
          return;
        }

        if (result.token) {
          if (!syncEnabled) return; // Check again
          setSupabaseToken(result.token);
          tokenBoundRef.current = true;
          useSyncStore.getState().setSyncStatus(null);

          // Now ensure user
          try {
            await ensureAppUser(user, getToken);
          } catch (e) {
            console.error('[Sync] Failed to ensure app user:', e);
          }
        }
      } catch (e) {
        console.error('[Sync] Failed to init user:', e);
      } finally {
        initInProgressRef.current = false;
      }
    };

    initInProgressRef.current = true;
    initUser();
  }, [isLoaded, isSignedIn, userId, syncEnabled, user, getToken, isOnline]);

  // Auto-sync logic
  useEffect(() => {
    // Only sync if conditions are met AND something actually changed
    const shouldSync =
      syncEnabled &&
      isSignedIn &&
      userId &&
      isOnline &&
      isLoaded &&
      (lastAutoSyncRef.current.userId !== userId ||
        lastAutoSyncRef.current.syncEnabled !== syncEnabled);

    if (shouldSync) {
      lastAutoSyncRef.current = { userId, syncEnabled };

      // Check if this is a new device
      if (isNewDevice) {
        // isNewDevice is updated from hook
        console.log('[Sync] New device detected, pulling all data...');
        pullAllDataForNewDevice();
      } else {
        syncNow();
      }
    }
  }, [syncEnabled, isSignedIn, userId, isLoaded, isNewDevice, pullAllDataForNewDevice, syncNow]);

  return null;
};
