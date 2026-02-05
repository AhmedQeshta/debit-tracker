import { useEffect, useState, useRef, useCallback } from 'react';
import { useSyncStore } from '@/store/syncStore';
import { syncService } from '@/services/syncService';
import { useAuth, useUser } from '@clerk/clerk-expo';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { setSupabaseToken, clearSupabaseToken, hasSupabaseToken } from '@/lib/supabase';
import { getFreshSupabaseJwt } from '@/services/authSync';
import { ensureAppUser } from '@/services/userService';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useBudgetStore } from '@/store/budgetStore';
import { selectPendingCount } from '@/selectors/dashboardSelectors';

export const useCloudSync = () => {
  const { syncEnabled, setSyncEnabled, isSyncing, setSyncing, lastSync } = useSyncStore();
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const [isOnline, setIsOnline] = useState(true);
  const tokenBoundRef = useRef(false);
  const initInProgressRef = useRef(false);
  const lastAutoSyncRef = useRef<{ userId: string | null; syncEnabled: boolean }>({ userId: null, syncEnabled: false });
  const retryAttemptsRef = useRef(0);
  const MAX_RETRY_ATTEMPTS = 3;
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
    if (
      isSignedIn &&
      isOnline &&
      !syncAutoEnabledRef.current &&
      !syncEnabled
    ) {
      console.log('[Sync] Auto-enabling sync (online + logged in)');
      setSyncEnabled(true);
      syncAutoEnabledRef.current = true;
    }

    // Reset auto-enable flag when user logs out or goes offline
    if (!isSignedIn || !isOnline) {
      syncAutoEnabledRef.current = false;
    }
  }, [isLoaded, isSignedIn, isOnline, syncEnabled, setSyncEnabled]);

  // Clear token and cloudUserId when logged out or sync disabled
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !syncEnabled) {
      clearSupabaseToken();
      tokenBoundRef.current = false;
      useSyncStore.getState().setCloudUserId(null);
      useSyncStore.getState().setSyncStatus(null); // Clear sync status
      // Reset auto-sync tracking
      lastAutoSyncRef.current = { userId: null, syncEnabled: false };
      if (!isSignedIn) {
        console.log('[Sync] Token cleared: user logged out');
      } else if (!syncEnabled) {
        console.log('[Sync] Token cleared: sync disabled');
      }
    }
  }, [isLoaded, isSignedIn, syncEnabled]);

  // Bind token and ensure user record - reordered to prevent race condition
  // STRICT GATING: Only runs when syncEnabled is true
  useEffect(() => {
    // Prevent multiple simultaneous initializations
    if (initInProgressRef.current) {
      return;
    }

    const initUser = async () => {
      // Step 1: STRICT CHECK - If sync disabled -> clear token and return IMMEDIATELY
      // This must be the FIRST check to prevent any sync operations when disabled
      if (!syncEnabled) {
        setSupabaseToken(null);
        tokenBoundRef.current = false;
        initInProgressRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: sync disabled (strict gate)');
        return; // Do NOT proceed with any sync operations
      }

      // Step 2: Check if not signed in -> clear token and return
      if (!isSignedIn) {
        setSupabaseToken(null);
        tokenBoundRef.current = false;
        initInProgressRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: user not signed in');
        return;
      }

      // Step 3: Check if not loaded -> return early
      if (!isLoaded) {
        initInProgressRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: Clerk not loaded');
        return;
      }

      // Step 4: Check if no user object -> return early
      if (!user || !userId) {
        initInProgressRef.current = false;
        console.log('[Sync] ensureUserRecord skipped: no user object');
        return;
      }

      // Step 5: Check if token is already bound - skip if so
      if (tokenBoundRef.current && hasSupabaseToken()) {
        initInProgressRef.current = false;
        console.log('[Sync] Token already bound, skipping token fetch');
        // Still ensure user record exists
        try {
          const result = await ensureAppUser(user, getToken);
          if (result.skipped) {
            console.log(`[Sync] ensureAppUser skipped: ${result.reason}`);
          } else if (result.ok) {
            console.log('[Sync] App user ensured successfully');
          }
        } catch (e) {
          console.error('[Sync] Failed to ensure app user:', e);
        }
        return;
      }

      // Step 6: Get token with 'supabase' template
      let token: string | null = null;
      try {
        const result = await getFreshSupabaseJwt(getToken);
        token = result.token;
        
        // Handle template missing error
        if (result.error === 'template_missing') {
          console.error('[Sync] JWT template missing - setting sync status to needs_config');
          useSyncStore.getState().setSyncStatus('needs_config');
          initInProgressRef.current = false;
          return; // Don't proceed with ensureAppUser
        }
        
        // Handle other errors
        if (result.error === 'other' && !token) {
          console.warn('[Sync] Failed to get token from Clerk - ensureAppUser skipped');
          initInProgressRef.current = false;
          return;
        }
      } catch (e) {
        console.error('[Sync] Failed to get token:', e);
        initInProgressRef.current = false;
        return;
      }

      // Step 7: If no token -> log warning, do NOT throw, do NOT call ensureAppUser
      if (!token) {
        console.warn('[Sync] No token available from Clerk - ensureAppUser skipped');
        initInProgressRef.current = false;
        return;
      }
      
      // Clear any previous error status on successful token fetch
      useSyncStore.getState().setSyncStatus(null);

      // Step 8: Double-check syncEnabled is still true (it might have changed)
      // This prevents race conditions where sync is disabled while token is being fetched
      if (!syncEnabled) {
        clearSupabaseToken();
        tokenBoundRef.current = false;
        initInProgressRef.current = false;
        console.log('[Sync] ensureAppUser skipped: sync disabled during token fetch');
        return;
      }

      tokenBoundRef.current = true;

      // Step 9: Final check - ensure sync is still enabled before calling ensureAppUser
      if (!syncEnabled) {
        clearSupabaseToken();
        tokenBoundRef.current = false;
        initInProgressRef.current = false;
        console.log('[Sync] ensureAppUser skipped: sync disabled before ensureAppUser');
        return;
      }

      // Step 10: Then call ensureAppUser(user) - now token is ready AND sync is enabled
      try {
        const result = await ensureAppUser(user, getToken);
        if (result.skipped) {
          console.log(`[Sync] ensureAppUser skipped: ${result.reason}`);
        } else if (result.ok) {
          console.log('[Sync] App user ensured successfully, cloudUserId stored');
        }
      } catch (e) {
        console.error('[Sync] Failed to ensure app user:', e);
      } finally {
        initInProgressRef.current = false;
      }
    };

    initInProgressRef.current = true;
    initUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, userId, syncEnabled]); // Removed 'user' and 'getToken' - use userId instead

  // Monitor network status and update syncStore
  useEffect(() => {
    const updateNetworkState = (state: NetInfoState) => {
      const nowOnline = !!state.isConnected;
      setIsOnline(nowOnline);
      
      // Update syncStore network state
      useSyncStore.getState().setNetworkState({
        isConnected: nowOnline,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOnline = isOnline;
      updateNetworkState(state);
      const nowOnline = !!state.isConnected;
      
      // Only trigger sync when coming back online (not on every network change)
      if (nowOnline && !wasOnline && syncEnabled && isSignedIn && isLoaded) {
        syncNow();
      }
    });
    
    // Initial check
    NetInfo.fetch().then((state) => {
      updateNetworkState(state);
      setIsOnline(!!state.isConnected);
    });
    
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncEnabled, isSignedIn, isLoaded]); // syncNow is stable via useCallback

  // Auto-sync on syncEnabled change, login, or reconnect
  // Also detect new device and trigger pull
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
      if (isNewDevice()) {
        console.log('[Sync] New device detected, pulling all data...');
        pullAllDataForNewDevice();
      } else {
        // Normal sync (push + pull)
        syncNow();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncEnabled, isSignedIn, userId, isOnline, isLoaded, isNewDevice, pullAllDataForNewDevice]);

  // Detect if this is a new device (first sync)
  const isNewDevice = useCallback(() => {
    const { hasHydratedFromCloud } = useSyncStore.getState().deviceSyncState;
    const friends = useFriendsStore.getState().friends;
    const transactions = useTransactionsStore.getState().transactions;
    const budgets = useBudgetStore.getState().budgets;
    
    // New device if: no local data OR hasHydratedFromCloud is false
    const hasLocalData = friends.length > 0 || transactions.length > 0 || budgets.length > 0;
    return !hasHydratedFromCloud || !hasLocalData;
  }, []);

  // Pull all data for new device
  const pullAllDataForNewDevice = useCallback(async (isRetry: boolean = false) => {
    const { isSyncRunning, cloudUserId } = useSyncStore.getState();
    
    // Mutex check
    if (isSyncRunning) {
      console.log('[Sync] pullAllDataForNewDevice skipped: sync already running');
      return;
    }

    if (!cloudUserId) {
      console.log('[Sync] pullAllDataForNewDevice skipped: no cloudUserId');
      return;
    }

    // Reset retry attempts on manual retry
    if (isRetry) {
      retryAttemptsRef.current = 0;
    }

    useSyncStore.getState().setIsSyncRunning(true);
    useSyncStore.getState().setSyncStatus('pulling');
    
    try {
      const result = await syncService.pullAllDataForUser(cloudUserId, getToken);
      
      if (result) {
        // Merge data using store merge methods (which handle conflict resolution)
        useFriendsStore.getState().mergeFriends(result.friends);
        useTransactionsStore.getState().mergeTransactions(result.transactions);
        useBudgetStore.getState().mergeBudgets(result.budgets);
        
        // Mark as hydrated
        useSyncStore.getState().setHasHydratedFromCloud(true);
        useSyncStore.getState().setLastPullAt(Date.now());
        useSyncStore.getState().setSyncStatus('success');
        useSyncStore.getState().setLastError(null);
        retryAttemptsRef.current = 0; // Reset on success
        
        console.log(
          `[Sync] Pull complete: ${result.counts.friends} friends, ${result.counts.transactions} transactions, ${result.counts.budgets} budgets, ${result.counts.budgetItems} items`,
        );
      }
    } catch (error: any) {
      console.error('[Sync] Pull failed:', error);
      // Error is already set in syncStore by pullAllDataForUser
      useSyncStore.getState().setSyncStatus('error');
      
      // Auto-retry with backoff (max 3 tries, only for timeout errors)
      const isTimeout = error?.message?.includes('timeout') || useSyncStore.getState().lastError?.code === 'TIMEOUT';
      if (isTimeout && retryAttemptsRef.current < MAX_RETRY_ATTEMPTS && isOnline) {
        retryAttemptsRef.current += 1;
        const backoffMs = Math.pow(2, retryAttemptsRef.current) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`[Sync] Auto-retrying pull in ${backoffMs}ms (attempt ${retryAttemptsRef.current}/${MAX_RETRY_ATTEMPTS})`);
        
        setTimeout(() => {
          const currentState = useSyncStore.getState();
          if (currentState.syncStatus === 'error' && !currentState.isSyncRunning && isOnline) {
            pullAllDataForNewDevice(false).catch((e) => console.error('[Sync] Auto-retry failed:', e));
          }
        }, backoffMs);
      } else if (retryAttemptsRef.current >= MAX_RETRY_ATTEMPTS) {
        console.log('[Sync] Max retry attempts reached, stopping auto-retry');
        retryAttemptsRef.current = 0;
      }
    } finally {
      useSyncStore.getState().setIsSyncRunning(false);
      useSyncStore.getState().setPullProgress(undefined);
    }
  }, [getToken, isOnline]);

  const syncNow = useCallback(async () => {
    // STRICT GATING: Check syncEnabled FIRST
    if (!syncEnabled) {
      console.log('[Sync] syncNow skipped: sync disabled (strict gate)');
      return;
    }

    // Mutex check
    const { isSyncRunning } = useSyncStore.getState();
    if (isSyncRunning) {
      console.log('[Sync] syncNow skipped: sync already running');
      return;
    }

    if (isSyncing || !userId || !isOnline || !isLoaded || !isSignedIn) {
      return;
    }

    // Double-check syncEnabled is still true
    if (!syncEnabled) {
      console.log('[Sync] syncNow skipped: sync disabled during checks');
      return;
    }

    // Ensure token is bound before syncing
    if (!tokenBoundRef.current || !hasSupabaseToken()) {
      try {
        const result = await getFreshSupabaseJwt(getToken);
        
        // Handle template missing error
        if (result.error === 'template_missing') {
          console.error('[Sync] JWT template missing during sync - setting sync status to needs_config');
          useSyncStore.getState().setSyncStatus('needs_config');
          return;
        }
        
        if (result.token) {
          // Final check before binding token
          if (!syncEnabled) {
            console.log('[Sync] syncNow skipped: sync disabled during token fetch');
            return;
          }
          tokenBoundRef.current = true;
          // Clear error status on successful token fetch
          useSyncStore.getState().setSyncStatus(null);
        } else {
          console.warn('[Sync] No token available - sync skipped');
          return;
        }
      } catch (e) {
        console.error('[Sync] Failed to get token for sync:', e);
        return;
      }
    }

    // Final check before syncing
    if (!syncEnabled) {
      console.log('[Sync] syncNow skipped: sync disabled before syncAll');
      return;
    }

    // Get cloudUserId from store
    const { cloudUserId } = useSyncStore.getState();
    if (!cloudUserId) {
      console.log('[Sync] syncNow skipped: no cloudUserId');
      return;
    }

    if (!userId) {
      console.log('[Sync] syncNow skipped: no userId (Clerk user ID)');
      return;
    }

    setSyncing(true);
    useSyncStore.getState().setIsSyncRunning(true);
    useSyncStore.getState().setSyncStatus('pushing');
    
    try {
      await syncService.syncAll(cloudUserId, userId, getToken);
      useSyncStore.getState().setSyncStatus('success');
      useSyncStore.getState().setLastError(null);
    } catch (e) {
      console.error('[Sync] Sync failed:', e);
      // Error status is set by syncService
    } finally {
      setSyncing(false);
      useSyncStore.getState().setIsSyncRunning(false);
    }
  }, [syncEnabled, isSyncing, userId, isOnline, isLoaded, isSignedIn, getToken]);

  // Expose helpers
  const hasPendingChanges = selectPendingCount() > 0;

  return {
    syncEnabled,
    setSyncEnabled,
    syncNow,
    isSyncing,
    lastSync,
    hasPendingChanges,
    isOnline,
    isLoggedIn: !!isSignedIn,
    isNewDevice: isNewDevice(),
    pullAllDataForNewDevice,
  };
};
