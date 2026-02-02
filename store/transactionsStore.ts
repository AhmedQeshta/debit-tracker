import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITransactionsState } from '@/types/store';
import { Transaction } from '@/types/models';

export const useTransactionsStore = create<ITransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            { ...transaction, synced: false, updatedAt: Date.now() },
            ...state.transactions,
          ],
        })),
      updateTransaction: (updatedTransaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === updatedTransaction.id
              ? { ...updatedTransaction, synced: false, updatedAt: Date.now() }
              : t,
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      getDirtyTransactions: (): Transaction[] => {
        return get().transactions.filter((t) => !t.synced || t.synced === false);
      },
      setTransactions: (transactions) => set({ transactions }),
      mergeTransactions: (remoteTransactions) =>
        set((state) => {
          // Use conflict resolution: merge with deletions support
          const localMap = new Map(state.transactions.map((t) => [t.id, t]));
          const remoteIds = new Set(remoteTransactions.map((t) => t.id));
          
          // Process remote items with conflict resolution
          remoteTransactions.forEach((remote) => {
            const local = localMap.get(remote.id);
            if (!local) {
              // Remote item doesn't exist locally -> add it
              localMap.set(remote.id, { ...remote, synced: true });
            } else {
              // Conflict resolution: use the one with newer updatedAt
              const remoteUpdatedAt = remote.updatedAt || 0;
              const localUpdatedAt = local.updatedAt || 0;
              if (remoteUpdatedAt > localUpdatedAt) {
                // Remote is newer -> use remote
                localMap.set(remote.id, { ...remote, synced: true });
              } else {
                // Local is newer or equal -> keep local (but mark as synced if remote exists)
                localMap.set(remote.id, { ...local, synced: local.synced || true });
              }
            }
          });
          
          // Remove local items that don't exist in remote (hard delete in DB)
          const merged = Array.from(localMap.values()).filter((item) => remoteIds.has(item.id));
          
          return { transactions: merged };
        }),
      markAsSynced: (id) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, synced: true } : t)),
        })),
    }),
    {
      name: 'transactions-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
