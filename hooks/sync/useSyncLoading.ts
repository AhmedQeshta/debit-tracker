import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useSyncStore } from '@/store/syncStore';

export const useSyncLoading = () => {
  const { syncStatus, pullProgress, lastError } = useSyncStore();
  const { pullAllDataForNewDevice, isOnline } = useCloudSync();

  // Show overlay when pulling data for new device
  const isPulling = syncStatus === 'pulling';
  const hasError = syncStatus === 'error' && lastError;

  const handleRetry = () => {
    useSyncStore.getState().setLastError(null);
    useSyncStore.getState().setSyncStatus('pulling');
    pullAllDataForNewDevice(true, { blocking: true }); // Pass true to indicate manual retry
  };

  const handleContinueOffline = () => {
    useSyncStore.getState().setHasHydratedFromCloud(true); // Mark as hydrated to prevent retry loop
    useSyncStore.getState().setSyncStatus(null);
    useSyncStore.getState().setLastError(null);
  };

  return {
    hasError,
    lastError,
    isOnline,
    handleRetry,
    handleContinueOffline,
    isPulling,
    pullProgress,
  };
};
