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
  const cloudUserId = useSyncStore((state) => state.cloudUserId);

  const tokenBoundRef = useRef(false);
  const initInProgressRef = useRef(false);
  const lastAutoSyncRef = useRef<{ userId: string | null; syncEnabled: boolean }>({
    userId: null,
    syncEnabled: false,
  });
  const previousUserIdRef = useRef<string | null>(null);
  const syncAutoEnabledRef = useRef(false);
  const wasOnlineRef = useRef(false);
  const deferredPullPendingRef = useRef(false);

  // Helper to clear all local data
  const clearAllLocalData = useCallback(() => {
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
      clearSupabaseToken();
      tokenBoundRef.current = false;
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null);
      clearAllLocalData();
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
      syncAutoEnabledRef.current = false;
      deferredPullPendingRef.current = false;
    }

    // User logged out
    if (previousUserId !== null && currentUserId === null) {
      clearSupabaseToken();
      tokenBoundRef.current = false;
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null);
      clearAllLocalData();
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
      syncAutoEnabledRef.current = false;
      deferredPullPendingRef.current = false;
    }

    previousUserIdRef.current = currentUserId;
  }, [isLoaded, userId, clearAllLocalData]);

  // Enable sync by default when online + logged in
  useEffect(() => {
    if (!isLoaded) return;

    // Auto-enable sync when conditions are met (only once per session)
    if (isSignedIn && isOnline && !syncAutoEnabledRef.current && !syncEnabled) {
      setSyncEnabled(true);
      syncAutoEnabledRef.current = true;
    }

    // Reset auto-enable flag when user logs out or goes offline
    if (!isSignedIn || !isOnline) {
      syncAutoEnabledRef.current = false;
    }
  }, [isLoaded, isSignedIn, syncEnabled, setSyncEnabled, isOnline]);

  // Clear token and cloudUserId when logged out or sync disabled
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !syncEnabled) {
      clearSupabaseToken();
      tokenBoundRef.current = false;
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null);
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
      deferredPullPendingRef.current = false;
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
          } catch (e) {
            console.error('[Sync] Failed to ensure app user:', e);
          }
        }
        return;
      }

      if (!isOnline) {
        deferredPullPendingRef.current = true;
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
            deferredPullPendingRef.current = true;
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

  // Track reconnect transitions and defer fetch until online + ready
  useEffect(() => {
    if (!isLoaded) return;

    const hasSession = isSignedIn && !!userId && syncEnabled;
    const cameOnline = !wasOnlineRef.current && isOnline;
    wasOnlineRef.current = isOnline;

    if (!hasSession) {
      deferredPullPendingRef.current = false;
      return;
    }

    if (!isOnline) {
      deferredPullPendingRef.current = true;
      return;
    }

    if (cameOnline) {
      deferredPullPendingRef.current = true;
    }
  }, [isLoaded, isSignedIn, userId, syncEnabled, isOnline]);

  // Auto-sync logic
  useEffect(() => {
    const canSync = syncEnabled && isSignedIn && !!userId && isOnline && isLoaded && !!cloudUserId;

    if (!canSync) return;

    if (deferredPullPendingRef.current) {
      deferredPullPendingRef.current = false;
      if (isNewDevice) {
        pullAllDataForNewDevice(false, { blocking: false });
      } else {
        syncNow();
      }
      return;
    }

    // Only sync if conditions are met AND something actually changed
    const shouldSync =
      lastAutoSyncRef.current.userId !== userId ||
      lastAutoSyncRef.current.syncEnabled !== syncEnabled;

    if (shouldSync) {
      lastAutoSyncRef.current = { userId, syncEnabled };

      // Check if this is a new device
      if (isNewDevice) {
        pullAllDataForNewDevice(false, { blocking: false });
      } else {
        syncNow();
      }
    }
  }, [
    syncEnabled,
    isSignedIn,
    userId,
    isLoaded,
    isOnline,
    cloudUserId,
    isNewDevice,
    pullAllDataForNewDevice,
    syncNow,
  ]);

  return null;
};
