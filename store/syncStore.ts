import { SyncQueueItem } from '@/types/models';
import { ISyncState, NetworkState, SyncError } from '@/types/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const mapLegacyOperation = (item: SyncQueueItem): SyncQueueItem['operation'] => {
  if (item.operation) return item.operation;

  if (item.type === 'friend') return 'FRIEND_UPSERT';
  if (item.type === 'friend_pin') return 'FRIEND_PIN_TOGGLE';
  if (item.type === 'budget') return 'BUDGET_UPSERT';
  if (item.type === 'budget_pin') return 'BUDGET_PIN_TOGGLE';
  if (item.type === 'settle_friend') return 'SETTLE_FRIEND';

  if (item.type === 'budget_item') {
    return item.action === 'delete' ? 'BUDGET_ITEM_DELETE' : 'BUDGET_ITEM_UPSERT';
  }

  if (item.type === 'transaction') {
    return item.action === 'delete' ? 'TX_DELETE' : 'TX_UPSERT';
  }

  return 'TX_UPSERT';
};

const normalizeQueueItem = (item: SyncQueueItem): SyncQueueItem => {
  return {
    ...item,
    operation: mapLegacyOperation(item),
    createdAt: item.createdAt ?? Date.now(),
    attempts: item.attempts ?? 0,
    status: item.status ?? 'pending',
    entityId: item.entityId ?? item.payload?.id,
  };
};

const normalizeQueue = (queue: SyncQueueItem[]): SyncQueueItem[] => {
  return queue.map((item) => normalizeQueueItem(item));
};

export const useSyncStore = create<ISyncState>()(
  persist(
    (set) => ({
      queue: [],
      isSyncing: false,
      syncEnabled: false, // Default to false
      isSigningOut: false,
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
          queue: [...state.queue, normalizeQueueItem(item)],
        })),

      updateQueueItem: (id: string, patch: Partial<SyncQueueItem>) =>
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? normalizeQueueItem({ ...item, ...patch }) : item,
          ),
        })),

      removeFromQueue: (id: string) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        })),

      clearQueueForFriend: (friendId: string, transactionIds?: string[]) =>
        set((state) => {
          const transactionIdSet = new Set(transactionIds || []);
          return {
            queue: state.queue.filter((item) => {
              if (item.type === 'settle_friend' && item.payload?.friendId === friendId) {
                return false;
              }

              if (item.type !== 'transaction') {
                return true;
              }

              if (item.payload?.friendId === friendId) {
                return false;
              }

              if (item.payload?.id && transactionIdSet.has(item.payload.id)) {
                return false;
              }

              return true;
            }),
          };
        }),

      setSyncing: (status: boolean) => set({ isSyncing: status }),

      setIsSigningOut: (status: boolean) => set({ isSigningOut: status }),

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
      partialize: (state) => {
        const { isSigningOut, ...persistedState } = state;
        return {
          ...persistedState,
          queue: normalizeQueue(persistedState.queue),
        };
      },
    },
  ),
);
