import { selectPendingCount } from '@/lib/dashboardSelectors';
import { getFreshSupabaseJwt } from '@/services/authSync';
import { getNetworkSnapshot, isNetworkReachable, pingSupabase } from '@/services/net';
import { getSyncErrorCode } from '@/services/syncErrors';
import { syncService } from '@/services/syncService';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useAuth } from '@clerk/clerk-expo';
import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useCloudSync = () => {
  const { t } = useTranslation();
  const { syncEnabled, setSyncEnabled, isSyncing, setSyncing, lastSync } = useSyncStore();
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const retryAttemptsRef = useRef(0);

  const syncErrorMessageFromReason = useCallback(
    (reason?: string) => {
      if (reason === 'offline') return t('sync.status.noInternet');
      if (reason === 'timeout') return t('sync.status.timeoutRetry');
      if (reason === 'rate_limited') return t('sync.status.rateLimitedRetry');
      if (reason === 'auth') return t('sync.status.needsLogin');
      if (reason === 'server') return t('sync.status.serverRetry');
      if (reason === 'validation/conflict') return t('sync.status.validationConflict');
      return t('cloudSyncHooks.errors.someChangesFailed');
    },
    [t],
  );

  const evaluateConnectivity = useCallback(async () => {
    const net = await getNetworkSnapshot();

    useSyncStore.getState().setNetworkState({
      isConnected: net.isConnected,
      isInternetReachable: net.isInternetReachable,
      type: net.type,
    });

    if (!isNetworkReachable(net)) {
      setIsOnline(false);
      return { ok: false as const, reason: 'offline' as const };
    }

    const ping = await pingSupabase();
    if (!ping.ok && ping.errorType === 'network') {
      setIsOnline(false);
      return { ok: false as const, reason: 'offline' as const };
    }

    setIsOnline(true);
    return { ok: true as const };
  }, []);

  // Monitor network status (passive listener - ok to keep here for state update)
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const reachable =
        typeof state.isInternetReachable === 'boolean'
          ? state.isInternetReachable
          : !!state.isConnected;

      useSyncStore.getState().setNetworkState({
        isConnected: !!state.isConnected,
        isInternetReachable:
          typeof state.isInternetReachable === 'boolean' ? state.isInternetReachable : undefined,
        type: state.type,
      });

      setIsOnline(reachable);
    });

    void getNetworkSnapshot().then((snapshot) => {
      useSyncStore.getState().setNetworkState({
        isConnected: snapshot.isConnected,
        isInternetReachable: snapshot.isInternetReachable,
        type: snapshot.type,
      });
      setIsOnline(isNetworkReachable(snapshot));
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
    async (isRetry: boolean = false, options?: { blocking?: boolean }) => {
      const { isSyncRunning, cloudUserId } = useSyncStore.getState();
      const isBlocking = options?.blocking ?? true;

      if (isSyncRunning || !cloudUserId) return;

      if (isRetry) {
        retryAttemptsRef.current = 0;
      }

      useSyncStore.getState().setIsSyncRunning(true);
      if (isBlocking) {
        useSyncStore.getState().setSyncStatus('pulling');
      }

      const connectivity = await evaluateConnectivity();
      if (!connectivity.ok) {
        useSyncStore.getState().setSyncStatus('error');
        useSyncStore.getState().setLastError({
          code: 'OFFLINE',
          message: t('sync.status.noInternet'),
          at: Date.now(),
        });
        useSyncStore.getState().setIsSyncRunning(false);
        return;
      }

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
        useSyncStore.getState().setLastError({
          message: error?.message || t('cloudSyncHooks.errors.pullFailed'),
          at: Date.now(),
        });

        if (isBlocking) {
          useSyncStore.getState().setSyncStatus('error');
        }
      } finally {
        useSyncStore.getState().setIsSyncRunning(false);
        useSyncStore.getState().setPullProgress(undefined);
      }
    },
    [evaluateConnectivity, getToken, t],
  );

  const syncNow = useCallback(async () => {
    // STRICT GATING
    if (!useSyncStore.getState().syncEnabled) return;

    const { isSyncRunning, isSyncing } = useSyncStore.getState();
    if (isSyncRunning) return;

    if (isSyncing || !userId || !isLoaded || !isSignedIn) {
      return;
    }

    const connectivity = await evaluateConnectivity();
    if (!connectivity.ok) {
      useSyncStore.getState().setSyncStatus('error');
      useSyncStore.getState().setLastError({
        code: 'OFFLINE',
        message: t('sync.status.noInternet'),
        at: Date.now(),
      });
      return;
    }

    // Preflight auth check (fresh Clerk token)
    try {
      const result = await getFreshSupabaseJwt(getToken);
      if (!result.token) {
        if (result.error === 'template_missing') {
          useSyncStore.getState().setSyncStatus('needs_config');
        }
        return;
      }
    } catch (e) {
      console.error('[Sync] Failed to get token for sync:', e);
      return;
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
      useSyncStore.getState().setSyncStatus('error');
      useSyncStore.getState().setLastError({
        code: 'SYNC_FAILED',
        message: t('sync.status.genericError'),
        details: e,
        at: Date.now(),
      });
    } finally {
      setSyncing(false);
      useSyncStore.getState().setIsSyncRunning(false);
    }
  }, [evaluateConnectivity, getToken, isLoaded, isSignedIn, setSyncing, t, userId]);

  const syncQueueNow = useCallback(
    async (options?: {
      onProgress?: (processed: number, total: number, itemId: string) => void;
    }) => {
      if (!useSyncStore.getState().syncEnabled) {
        return { total: 0, successCount: 0, failedCount: 0, blockedReason: 'unknown' as const };
      }

      const { isSyncRunning, isSyncing, cloudUserId } = useSyncStore.getState();
      if (isSyncRunning || isSyncing || !cloudUserId || !userId || !isLoaded || !isSignedIn) {
        return { total: 0, successCount: 0, failedCount: 0, blockedReason: 'unknown' as const };
      }

      const connectivity = await evaluateConnectivity();
      if (!connectivity.ok) {
        useSyncStore.getState().setSyncStatus('error');
        useSyncStore.getState().setLastError({
          code: 'OFFLINE',
          message: t('sync.status.noInternet'),
          at: Date.now(),
        });
        return { total: 0, successCount: 0, failedCount: 0, blockedReason: 'offline' as const };
      }

      setSyncing(true);
      useSyncStore.getState().setIsSyncRunning(true);
      useSyncStore.getState().setSyncStatus('pushing');
      useSyncStore.getState().setPullProgress('syncing 0 of 0');

      try {
        const summary = await syncService.syncQueueFlush(cloudUserId, userId, getToken, {
          chunkSize: 30,
          concurrency: 2,
          onProgress: (processed, total, itemId) => {
            useSyncStore.getState().setPullProgress(`syncing ${processed} of ${total}`);
            options?.onProgress?.(processed, total, itemId);
          },
        });

        if (summary.failedCount === 0 && !summary.blockedReason) {
          useSyncStore.getState().setSyncStatus('success');
          useSyncStore.getState().setLastError(null);
        } else {
          useSyncStore.getState().setSyncStatus('error');
          useSyncStore.getState().setLastError({
            code: summary.lastErrorCode || getSyncErrorCode(summary.blockedReason || 'unknown'),
            message: summary.lastErrorMessage || syncErrorMessageFromReason(summary.blockedReason),
            at: Date.now(),
          });
        }
        return summary;
      } finally {
        useSyncStore.getState().setPullProgress(undefined);
        setSyncing(false);
        useSyncStore.getState().setIsSyncRunning(false);
      }
    },
    [
      evaluateConnectivity,
      getToken,
      isLoaded,
      isSignedIn,
      setSyncing,
      syncErrorMessageFromReason,
      t,
      userId,
    ],
  );

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
    syncQueueNow,
  };
};
