import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { getTotalUnsyncedCount, getUnsyncedCounts } from '@/lib/dashboardSelectors';
import { setSupabaseAccessTokenGetter } from '@/lib/supabase';
import { getFreshSupabaseJwt } from '@/services/authSync';
import { ensureAppUser } from '@/services/userService';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useAuth, useUser } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';

const USER_DATA_STORAGE_KEYS = [
  'friends-storage',
  'transactions-storage',
  'budget-storage',
  'sync-storage',
];

/**
 * Singleton component that handles all global sync side effects.
 * - Monitors network state
 * - Handles user auth state changes (login/logout)
 * - Manages Supabase token binding
 * - Triggers auto-sync when conditions are met
 */
export const SyncInitializer = () => {
  const {
    syncEnabled,
    setSyncEnabled,
    syncNow,
    syncQueueNow,
    pullAllDataForNewDevice,
    isNewDevice,
    isOnline,
  } = useCloudSync();
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const cloudUserId = useSyncStore((state) => state.cloudUserId);
  const isSigningOut = useSyncStore((state) => state.isSigningOut);

  const initInProgressRef = useRef(false);
  const lastAutoSyncRef = useRef<{ userId: string | null; syncEnabled: boolean }>({
    userId: null,
    syncEnabled: false,
  });
  const previousUserIdRef = useRef<string | null>(null);
  const syncAutoEnabledRef = useRef(false);
  const wasOnlineRef = useRef(false);
  const deferredPullPendingRef = useRef(false);
  const recoveryPromptShownRef = useRef(false);
  const recoveryAutoSyncRef = useRef(false);

  // Helper to clear all local data
  const clearAllLocalData = useCallback(() => {
    useFriendsStore.getState().setFriends([]);
    useTransactionsStore.getState().setTransactions([]);
    useBudgetStore.getState().setBudgets([]);
    useSyncStore.getState().clearQueue();
    useSyncStore.getState().setLastError(null);
    useSyncStore.getState().setSyncStatus(null);
    useSyncStore.getState().setHasHydratedFromCloud(false);
    useSyncStore.getState().setLastPullAt(null);
  }, []);

  const discardLocalUnsyncedData = useCallback(async () => {
    clearAllLocalData();
    await AsyncStorage.multiRemove(USER_DATA_STORAGE_KEYS);
  }, [clearAllLocalData]);

  // Detect user switching and clear local data
  useEffect(() => {
    if (!isLoaded) return;

    const currentUserId = userId || null;
    const previousUserId = previousUserIdRef.current;

    // User switched (different user logged in)
    if (previousUserId !== null && currentUserId !== null && previousUserId !== currentUserId) {
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null);
      clearAllLocalData();
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
      syncAutoEnabledRef.current = false;
      deferredPullPendingRef.current = false;
    }

    // User logged out
    if (previousUserId !== null && currentUserId === null) {
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null);
      const unsynced = getTotalUnsyncedCount(getUnsyncedCounts());
      // Preserve unsynced data for crash/logout recovery when needed.
      if (unsynced === 0) {
        clearAllLocalData();
      }
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
      syncAutoEnabledRef.current = false;
      deferredPullPendingRef.current = false;
    }

    previousUserIdRef.current = currentUserId;
  }, [isLoaded, userId, clearAllLocalData]);

  // Recovery UX for pending unsynced data when session is missing.
  useEffect(() => {
    if (!isLoaded) return;

    const totalUnsynced = getTotalUnsyncedCount(getUnsyncedCounts());

    if (isSignedIn) {
      recoveryPromptShownRef.current = false;
      return;
    }

    if (totalUnsynced <= 0 || recoveryPromptShownRef.current) {
      return;
    }

    recoveryPromptShownRef.current = true;

    Alert.alert(
      'Unsynced changes found',
      `We found ${totalUnsynced} changes not saved to the cloud. Sign in to sync them.`,
      [
        {
          text: 'Discard changes',
          style: 'destructive',
          onPress: () => {
            void discardLocalUnsyncedData();
          },
        },
        {
          text: 'Sign in & Sync',
          onPress: () => {
            router.push('/(auth)/sign-in');
          },
        },
      ],
      { cancelable: true },
    );
  }, [discardLocalUnsyncedData, isLoaded, isSignedIn, router]);

  // Auto recover queued changes for valid sessions.
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !syncEnabled || !isOnline || !cloudUserId || isSigningOut) {
      recoveryAutoSyncRef.current = false;
      return;
    }

    const totalUnsynced = getTotalUnsyncedCount(getUnsyncedCounts());
    if (totalUnsynced <= 0 || recoveryAutoSyncRef.current) {
      return;
    }

    recoveryAutoSyncRef.current = true;
    useSyncStore.getState().setSyncStatus('pulling');
    useSyncStore.getState().setPullProgress('syncing 0 of 0');

    void syncQueueNow({
      onProgress: (processed, total) => {
        useSyncStore.getState().setPullProgress(`syncing ${processed} of ${total}`);
      },
    }).finally(() => {
      useSyncStore.getState().setPullProgress(undefined);
      if (useSyncStore.getState().syncStatus === 'pulling') {
        useSyncStore.getState().setSyncStatus(null);
      }
    });
  }, [cloudUserId, isLoaded, isOnline, isSignedIn, isSigningOut, syncEnabled, syncQueueNow]);

  // Enable sync by default when online + logged in
  useEffect(() => {
    if (!isLoaded) return;

    // Auto-enable sync when conditions are met (only once per session)
    if (isSignedIn && isOnline && !isSigningOut && !syncAutoEnabledRef.current && !syncEnabled) {
      setSyncEnabled(true);
      syncAutoEnabledRef.current = true;
    }

    // Reset auto-enable flag when user logs out or goes offline
    if (!isSignedIn || !isOnline) {
      syncAutoEnabledRef.current = false;
    }
  }, [isLoaded, isSignedIn, syncEnabled, setSyncEnabled, isOnline, isSigningOut]);

  // Clear token and cloudUserId when logged out or sync disabled
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !syncEnabled || isSigningOut) {
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null);
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
      deferredPullPendingRef.current = false;
    }
  }, [isLoaded, isSignedIn, syncEnabled, isSigningOut]);

  // Register Supabase token getter (fresh Clerk token per request)
  useEffect(() => {
    setSupabaseAccessTokenGetter(async () => {
      const latestState = useSyncStore.getState();
      if (!latestState.syncEnabled || latestState.isSigningOut) return null;
      if (!isLoaded || !isSignedIn) return null;

      return (await getToken({ template: 'supabase', skipCache: true })) ?? null;
    });

    return () => {
      setSupabaseAccessTokenGetter(null);
    };
  }, [getToken, isLoaded, isSignedIn]);

  // Bind token and ensure user record
  useEffect(() => {
    if (initInProgressRef.current) return;

    const initUser = async () => {
      // Step 1: STRICT CHECK - If sync disabled -> return
      if (!syncEnabled || isSigningOut) {
        initInProgressRef.current = false;
        return;
      }

      if (!isSignedIn || !isLoaded || !user || !userId || isSigningOut) {
        initInProgressRef.current = false;
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
          useSyncStore.getState().setSyncStatus(null);

          // Now ensure user
          try {
            await ensureAppUser(user, getToken);
            deferredPullPendingRef.current = true;
          } catch (e) {
            if (useSyncStore.getState().syncEnabled) {
              console.error('[Sync] Failed to ensure app user:', e);
            }
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
  }, [isLoaded, isSignedIn, userId, syncEnabled, user, getToken, isOnline, isSigningOut]);

  // Track reconnect transitions and defer fetch until online + ready
  useEffect(() => {
    if (!isLoaded) return;

    const hasSession = isSignedIn && !!userId && syncEnabled && !isSigningOut;
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
  }, [isLoaded, isSignedIn, userId, syncEnabled, isOnline, isSigningOut]);

  // Auto-sync logic
  useEffect(() => {
    const canSync =
      syncEnabled &&
      isSignedIn &&
      !!userId &&
      isOnline &&
      isLoaded &&
      !!cloudUserId &&
      !isSigningOut;

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
    isSigningOut,
    isNewDevice,
    pullAllDataForNewDevice,
    syncNow,
  ]);

  return null;
};
