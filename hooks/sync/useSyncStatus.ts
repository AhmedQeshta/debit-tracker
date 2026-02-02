import { useSyncStore } from '@/store/syncStore';
import { useCloudSync } from '@/hooks/sync/useCloudSync';

export const useSyncStatus = () =>
{

  const { queue, lastSync, isSyncing, syncEnabled, setSyncEnabled, syncStatus, lastError, network, pullProgress } = useSyncStore();
  const { isOnline, isLoggedIn, syncNow, pullAllDataForNewDevice, isNewDevice } = useCloudSync();



  const handleSync = () =>
  {
    if (isNewDevice)
    {
      pullAllDataForNewDevice();
    } else
    {
      syncNow();
    }
  };

  const handleRetry = () =>
  {
    useSyncStore.getState().setLastError(null);
    useSyncStore.getState().setSyncStatus(null);
    if (isNewDevice)
    {
      pullAllDataForNewDevice(true); // Pass true to indicate manual retry
    } else
    {
      syncNow();
    }
  };


  const isNetworkWeak = network.isConnected === false || network.isInternetReachable === false;
  const isTimeoutError = lastError?.code === 'TIMEOUT';

  return {
    syncEnabled,
    setSyncEnabled,
    isSyncing,
    syncStatus,
    handleSync,
    isOnline,
    isNetworkWeak,
    pullProgress,
    handleRetry,
    lastError,
    isTimeoutError,
    queue,
    lastSync,
    isLoggedIn
  }
}