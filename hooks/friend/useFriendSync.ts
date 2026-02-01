import { generateId } from '@/lib/utils';
import { syncService } from '@/services/syncService';
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
    await syncService.pushChanges();
  };

  return {
    addToSyncQueue,
    triggerSync,
  };
};
