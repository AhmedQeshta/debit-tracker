import { syncService } from '@/services/syncService';
import { useSyncStore } from '@/store/syncStore';
import { SyncQueueItem } from '@/types/models';
import { useAuth } from '@clerk/clerk-expo';
import NetInfo from '@react-native-community/netinfo';

export const useSyncMutation = () => {
  const { syncEnabled, addToQueue } = useSyncStore();
  const { isSignedIn, getToken, userId } = useAuth();

  const createQueueId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const mapOperation = (
    type: SyncQueueItem['type'],
    action: SyncQueueItem['action'],
  ): SyncQueueItem['operation'] => {
    if (type === 'friend') return 'FRIEND_UPSERT';
    if (type === 'friend_pin') return 'FRIEND_PIN_TOGGLE';
    if (type === 'budget') return 'BUDGET_UPSERT';
    if (type === 'budget_pin') return 'BUDGET_PIN_TOGGLE';
    if (type === 'settle_friend') return 'SETTLE_FRIEND';
    if (type === 'budget_item') {
      return action === 'delete' ? 'BUDGET_ITEM_DELETE' : 'BUDGET_ITEM_UPSERT';
    }
    return action === 'delete' ? 'TX_DELETE' : 'TX_UPSERT';
  };

  const mutate = async (
    type: SyncQueueItem['type'],
    action: SyncQueueItem['action'],
    payload: any,
  ) => {
    // If sync is disabled, do nothing (local changes already applied by caller)
    if (!syncEnabled) return;

    // Add to queue first (persisted) with metadata for crash recovery and retries.
    addToQueue({
      id: createQueueId(),
      type,
      action,
      operation: mapOperation(type, action),
      userId,
      ownerId: useSyncStore.getState().cloudUserId,
      entityId: payload?.id ?? payload?.friendId ?? payload?.budgetId,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending',
      payload,
    });

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
    const queueId = `settle_${friendId}_${createdAt}_${Math.random().toString(36).slice(2, 8)}`;
    addToQueue({
      id: queueId,
      type: 'settle_friend',
      action: 'settle',
      operation: 'SETTLE_FRIEND',
      ownerId: useSyncStore.getState().cloudUserId,
      userId,
      entityId: friendId,
      createdAt,
      attempts: 0,
      status: 'pending',
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
