import { useEffect } from 'react';
import { useSyncStore } from '@/store/syncStore';
import { syncService } from '@/services/syncService';
import { useAuth, useUser } from '@clerk/clerk-expo';
import NetInfo from '@react-native-community/netinfo';

export const useCloudSync = () => {
  const { syncEnabled, setSyncEnabled, isSyncing, setSyncing, lastSync, queue, addToQueue } =
    useSyncStore();
  const { isSignedIn, userId } = useAuth();

  // Auto-sync on syncEnabled change, login, or reconnect
  useEffect(() => {
    if (syncEnabled && isSignedIn && userId) {
      syncNow();
    }
  }, [syncEnabled, isSignedIn, userId]);

  // Listen for connection changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && syncEnabled && isSignedIn) {
        syncNow();
      }
    });
    return unsubscribe;
  }, [syncEnabled, isSignedIn]);

  const syncNow = async () => {
    if (isSyncing || !userId) return;

    setSyncing(true);
    try {
      await syncService.syncAll(userId);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  // Expose helpers
  const hasPendingChanges = queue.length > 0;

  return {
    syncEnabled,
    setSyncEnabled,
    syncNow,
    isSyncing,
    lastSync,
    hasPendingChanges,
    isOnline: true, // Need true implementation via useNetInfo hook if needed or just use NetInfo
    isLoggedIn: !!isSignedIn,
  };
};
