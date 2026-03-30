import { syncService } from '@/services/syncService';
import { useSyncStore } from '@/store/syncStore';
import { SyncQueueItem } from '@/types/models';
import { useAuth } from '@clerk/clerk-expo';
import NetInfo from '@react-native-community/netinfo';

export const useSyncMutation = () => {
  const { syncEnabled, addToQueue } = useSyncStore();
  const { isSignedIn, getToken, userId } = useAuth();

  const mutate = async (
    type: SyncQueueItem['type'],
    action: SyncQueueItem['action'],
    payload: any,
  ) => {
    // If sync is disabled, do nothing (local changes already applied by caller)
    if (!syncEnabled) return;

    // Add to queue first (persisted) - kept for backward compatibility
    addToQueue({ id: payload.id, type, action, payload });

    // Check environment
    const state = await NetInfo.fetch();
    const isOnline = !!state.isConnected;

    if (isOnline && isSignedIn && userId) {
      try {
        // Token is managed globally by useCloudSync, pushChanges now pushes all dirty items
        await syncService.pushChanges(getToken, userId);
      } catch (e) {
        console.error('[Sync] Immediate sync failed, item remains in queue:', e);
      }
    }
  };

  const mutateSettleFriend = async (friendId: string) => {
    if (!syncEnabled) return;

    const createdAt = Date.now();
    const queueId = `settle_${friendId}_${createdAt}`;
    addToQueue({
      id: queueId,
      type: 'settle_friend',
      action: 'settle',
      payload: { friendId, createdAt },
    });

    const state = await NetInfo.fetch();
    const isOnline = !!state.isConnected;

    if (isOnline && isSignedIn && userId) {
      try {
        await syncService.pushChanges(getToken, userId);
      } catch (e) {
        console.error('[Sync] Immediate settle sync failed, item remains in queue:', e);
      }
    }
  };

  return { mutate, mutateSettleFriend };
};
