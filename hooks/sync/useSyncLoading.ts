import { useSyncStore } from '@/store/syncStore';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useState } from 'react';

export const useSyncLoading = () =>
{
  const { syncStatus, pullProgress, lastError } = useSyncStore();
  const { pullAllDataForNewDevice, isOnline } = useCloudSync();
  const [showContinueOffline, setShowContinueOffline] = useState(false);

  // Show overlay when pulling data for new device
  const isPulling = syncStatus === 'pulling';
  const hasError = syncStatus === 'error' && lastError;




  const handleRetry = () =>
  {
    setShowContinueOffline(false);
    useSyncStore.getState().setLastError(null);
    useSyncStore.getState().setSyncStatus('pulling');
    pullAllDataForNewDevice(true); // Pass true to indicate manual retry
  };

  const handleContinueOffline = () =>
  {
    setShowContinueOffline(false);
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
    pullProgress
  }
}