import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncQueueItem } from '@/types/models';
import { ISyncState, NetworkState, SyncError } from '@/types/store';

export const useSyncStore = create<ISyncState>()(
  persist(
    (set) => ({
      queue: [],
      isSyncing: false,
      syncEnabled: false, // Default to false
      lastSync: null,
      cloudUserId: null,
      syncStatus: null,
      deviceSyncState: {
        hasHydratedFromCloud: false,
        lastPullAt: null,
      },
      lastError: null,
      network: {
        isConnected: true,
        isInternetReachable: undefined,
        type: undefined,
      },
      latencyMs: undefined,
      isSyncRunning: false,
      pullProgress: undefined,

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

      setHasHydratedFromCloud: (hasHydrated: boolean) =>
        set((state) => ({
          deviceSyncState: {
            ...state.deviceSyncState,
            hasHydratedFromCloud: hasHydrated,
          },
        })),

      setLastPullAt: (timestamp: number | null) =>
        set((state) => ({
          deviceSyncState: {
            ...state.deviceSyncState,
            lastPullAt: timestamp,
          },
        })),

      setLastError: (error: SyncError | null) => set({ lastError: error }),

      setNetworkState: (state: NetworkState) => set({ network: state }),

      setLatencyMs: (ms: number | undefined) => set({ latencyMs: ms }),

      setIsSyncRunning: (running: boolean) => set({ isSyncRunning: running }),

      setPullProgress: (progress: string | undefined) => set({ pullProgress: progress }),
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
