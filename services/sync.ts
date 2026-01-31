import { useSyncStore } from '../store/syncStore';
import { useFriendsStore } from '../store/friendsStore';
import { useTransactionsStore } from '../store/transactionsStore';
import { checkNetwork } from './net';

export const syncData = async () => {
  const isOnline = await checkNetwork();
  if (!isOnline) {
    console.log('Skipping sync: Offline');
    return;
  }

  const { queue, isSyncing, setSyncing, removeFromQueue } = useSyncStore.getState();
  const { markAsSynced: markFriendSynced } = useFriendsStore.getState();
  const { markAsSynced: markTransactionSynced } = useTransactionsStore.getState();

  if (queue.length === 0 || isSyncing) return;

  setSyncing(true);
  console.log(`Starting sync of ${queue.length} items...`);

  // Process queue items one by one
  // We make a copy of the queue to avoid issues with concurrent modifications
  const currentQueue = [...queue];

  for (const item of currentQueue) {
    try {
      // Mock API call delay to simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`Synced ${item.type} action ${item.action}: ${item.id}`);

      if (item.type === 'friend') {
        markFriendSynced(item.payload.id);
      } else if (item.type === 'transaction') {
        markTransactionSynced(item.payload.id);
      }

      removeFromQueue(item.id);
    } catch (error) {
      console.error(`Failed to sync item ${item.id}`, error);
      // In a real app, we might retry or mark as failed
    }
  }

  setSyncing(false);
  console.log('Sync completed');
};
