import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncQueueItem } from '@/types/models';
import { ISyncState } from '@/types/store';

export const useSyncStore = create<ISyncState>()(
  persist(
    (set) => ({
      queue: [],
      isSyncing: false,
      syncEnabled: false, // Default to false
      lastSync: null,
      cloudUserId: null,
      syncStatus: null,

      addToQueue: (item: SyncQueueItem) =>
        set((state) => ({
          queue: [...state.queue, item],
        })),

      removeFromQueue: (id: string) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        })),

      setSyncing: (status: boolean) => set({ isSyncing: status }),

      clearQueue: () => set({ queue: [] }),

      setSyncEnabled: (enabled: boolean) => set({ syncEnabled: enabled }),

      setLastSync: (timestamp: number) => set({ lastSync: timestamp }),

      setCloudUserId: (id: string | null) => set({ cloudUserId: id }),

      setSyncStatus: (status: ISyncState['syncStatus']) => set({ syncStatus: status }),
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
