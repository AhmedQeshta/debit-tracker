import { generateId } from '@/lib/utils';
import { syncData } from '@/services/sync';
import { useSyncStore } from '@/store/syncStore';

export const useFriendSync = () => {
  const { addToQueue } = useSyncStore();

  const addToSyncQueue = (
    type: 'friend' | 'transaction',
    action: 'create' | 'update' | 'delete',
    payload: any,
  ): void => {
    addToQueue({
      id: generateId(),
      type,
      action,
      payload,
    });
  };

  const triggerSync = async (): Promise<void> => {
    await syncData();
  };

  return {
    addToSyncQueue,
    triggerSync,
  };
};
