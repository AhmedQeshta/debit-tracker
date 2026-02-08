import { hasSupabaseToken, setSupabaseToken } from '@/lib/supabase';
import { selectPendingCount } from '@/selectors/dashboardSelectors';
import { getFreshSupabaseJwt } from '@/services/authSync';
import { syncService } from '@/services/syncService';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useAuth } from '@clerk/clerk-expo';
import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useCloudSync = () => {
  const { syncEnabled, setSyncEnabled, isSyncing, setSyncing, lastSync } = useSyncStore();
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const retryAttemptsRef = useRef(0);

  // Monitor network status (passive listener - ok to keep here for state update)
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    NetInfo.fetch().then((state) => {
      setIsOnline(!!state.isConnected);
    });
    return unsubscribe;
  }, []);

  // Check if new device
  const isNewDevice = useCallback(() => {
    const { hasHydratedFromCloud } = useSyncStore.getState().deviceSyncState;
    const friends = useFriendsStore.getState().friends;
    const transactions = useTransactionsStore.getState().transactions;
    const budgets = useBudgetStore.getState().budgets;

    const hasLocalData = friends.length > 0 || transactions.length > 0 || budgets.length > 0;
    return !hasHydratedFromCloud || !hasLocalData;
  }, []);

  // Pull all data
  const pullAllDataForNewDevice = useCallback(
    async (isRetry: boolean = false) => {
      const { isSyncRunning, cloudUserId } = useSyncStore.getState();

      if (isSyncRunning || !cloudUserId) return;

      if (isRetry) {
        retryAttemptsRef.current = 0;
      }

      useSyncStore.getState().setIsSyncRunning(true);
      useSyncStore.getState().setSyncStatus('pulling');

      try {
        const result = await syncService.pullAllDataForUser(cloudUserId, getToken);

        if (result) {
          useFriendsStore.getState().mergeFriends(result.friends);
          useTransactionsStore.getState().mergeTransactions(result.transactions);
          useBudgetStore.getState().mergeBudgets(result.budgets);

          useSyncStore.getState().setHasHydratedFromCloud(true);
          useSyncStore.getState().setLastPullAt(Date.now());
          useSyncStore.getState().setSyncStatus('success');
          useSyncStore.getState().setLastError(null);
          retryAttemptsRef.current = 0;
        }
      } catch (error: any) {
        console.error('[Sync] Pull failed:', error);
        useSyncStore.getState().setSyncStatus('error');
      } finally {
        useSyncStore.getState().setIsSyncRunning(false);
        useSyncStore.getState().setPullProgress(undefined);
      }
    },
    [getToken],
  );

  const syncNow = useCallback(async () => {
    // STRICT GATING
    if (!useSyncStore.getState().syncEnabled) return;

    const { isSyncRunning, isSyncing } = useSyncStore.getState();
    if (isSyncRunning) return;

    if (isSyncing || !userId || !isOnline || !isLoaded || !isSignedIn) {
      return;
    }

    // Ensure token is bound (check global state)
    if (!hasSupabaseToken()) {
      if (!isOnline) return;
      try {
        const result = await getFreshSupabaseJwt(getToken);
        if (result.token) {
          // Double check after await
          if (!useSyncStore.getState().syncEnabled) return;
          setSupabaseToken(result.token);
          useSyncStore.getState().setSyncStatus(null);
        } else {
          return;
        }
      } catch (e) {
        console.error('[Sync] Failed to get token for sync:', e);
        return;
      }
    }

    // Final check
    if (!useSyncStore.getState().syncEnabled) return;

    const { cloudUserId } = useSyncStore.getState();
    if (!cloudUserId) return;

    setSyncing(true);
    useSyncStore.getState().setIsSyncRunning(true);
    useSyncStore.getState().setSyncStatus('pushing');

    try {
      await syncService.syncAll(cloudUserId, userId, getToken);
      useSyncStore.getState().setSyncStatus('success');
      useSyncStore.getState().setLastError(null);
    } catch (e) {
      console.error('[Sync] Sync failed:', e);
    } finally {
      setSyncing(false);
      useSyncStore.getState().setIsSyncRunning(false);
    }
  }, [userId, isOnline, isLoaded, isSignedIn, getToken, setSyncing]);

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
