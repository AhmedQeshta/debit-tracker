import { useSyncStore } from '@/store/syncStore';
import { syncService } from '@/services/syncService';
import { useAuth } from '@clerk/clerk-expo';
import NetInfo from '@react-native-community/netinfo';
import { SyncQueueItem } from '@/types/models';

export const useSyncMutation = () => {
  const { syncEnabled, addToQueue } = useSyncStore();
  const { isSignedIn } = useAuth();

  const mutate = async (type: SyncQueueItem['type'], action: SyncQueueItem['action'], payload: any) => {
    // If sync is disabled, do nothing (local changes already applied by caller)
    if (!syncEnabled) return;

    // Add to queue first (persisted)
    addToQueue({ id: payload.id, type, action, payload });

    // Check environment
    const state = await NetInfo.fetch();
    const isOnline = !!state.isConnected;

    if (isOnline && isSignedIn) {
      try {
        // Token is managed globally by useCloudSync, just call pushChanges
        await syncService.pushChanges();
      } catch (e) {
        console.error('[Sync] Immediate sync failed, item remains in queue:', e);
      }
    }
  };

  return { mutate };
};
