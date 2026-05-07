import { useCloudSync } from '@/hooks/sync/useCloudSync';import { useSyncStore } from '@/store/syncStore';

export const useSyncStatus = () => {
  const {
    lastSync,
    isSyncing,
    syncEnabled,
    setSyncEnabled,
    syncStatus,
    lastError,
    network,
    pullProgress,
  } = useSyncStore();
  const { isOnline, isLoggedIn, pullAllDataForNewDevice, isNewDevice, syncQueueNow } =
    useCloudSync();

  const handleSync = () => {
    if (isNewDevice) {
      pullAllDataForNewDevice(false, { blocking: true });
    } else {
      syncQueueNow();
    }
  };

  const handleRetry = () => {
    useSyncStore.getState().setLastError(null);
    useSyncStore.getState().setSyncStatus(null);
    if (isNewDevice) {
      pullAllDataForNewDevice(true, { blocking: true }); // Pass true to indicate manual retry
    } else {
      syncQueueNow();
    }
  };

  const isNetworkWeak = network.isConnected === false || network.isInternetReachable === false;
  const isTimeoutError = lastError?.code === 'TIMEOUT';
  const isOfflineError = lastError?.code === 'OFFLINE';
  const isRateLimitedError = lastError?.code === 'RATE_LIMITED';
  const isServerError = lastError?.code === 'SERVER';

  return {
    syncEnabled,
    setSyncEnabled,
    isSyncing,
    syncStatus,
    handleSync,
    syncQueueNow,
    isOnline,
    isNetworkWeak,
    pullProgress,
    handleRetry,
    lastError,
    isTimeoutError,
    isOfflineError,
    isRateLimitedError,
    isServerError,
    lastSync,
    isLoggedIn,
  };
};
