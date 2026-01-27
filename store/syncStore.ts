import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncQueueItem } from '../types/models';

interface SyncState {
  queue: SyncQueueItem[];
  isSyncing: boolean;
  addToQueue: (item: SyncQueueItem) => void;
  removeFromQueue: (id: string) => void;
  setSyncing: (status: boolean) => void;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      queue: [],
      isSyncing: false,
      addToQueue: (item) => set((state) => ({ queue: [...state.queue, item] })),
      removeFromQueue: (id) => set((state) => ({ queue: state.queue.filter((i) => i.id !== id) })),
      setSyncing: (status) => set({ isSyncing: status }),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
