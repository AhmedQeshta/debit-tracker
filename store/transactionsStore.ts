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
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, deletedAt: Date.now(), synced: false } : t,
          ),
        })),
      getDirtyTransactions: (): Transaction[] =>
      {
        return get().transactions.filter((t) =>
        {
          // Include items that are not synced AND not deleted
          // Deleted items are handled separately by getDeletedTransactions()
          return !t.synced && t.deletedAt === undefined;
        });
      },
      getDeletedTransactions: (): Transaction[] =>
      {
        return get().transactions.filter((t) => t.deletedAt !== undefined);
      },
      removeDeletedTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      setTransactions: (transactions) => set({ transactions }),
      mergeTransactions: (remoteTransactions) =>
        set((state) =>
        {
          // Use conflict resolution: merge with deletions support
          const localMap = new Map(state.transactions.map((t) => [t.id, t]));
          const remoteIds = new Set(remoteTransactions.map((t) => t.id));

          // Process remote items with conflict resolution
          remoteTransactions.forEach((remote) =>
          {
            const local = localMap.get(remote.id);
            if (!local)
            {
              // Remote item doesn't exist locally -> add it
              localMap.set(remote.id, { ...remote, synced: true });
            } else
            {
              // Conflict resolution: use the one with newer updatedAt
              const remoteUpdatedAt = remote.updatedAt || 0;
              const localUpdatedAt = local.updatedAt || 0;
              if (remoteUpdatedAt > localUpdatedAt)
              {
                // Remote is newer -> use remote (clear any local deletion)
                localMap.set(remote.id, { ...remote, synced: true });
              } else
              {
                // Local is newer or equal -> keep local (but mark as synced if remote exists)
                localMap.set(remote.id, { ...local, synced: local.synced || true });
              }
            }
          });

          // Handle local items not in remote:
          // - If local has deletedAt → remove it (already deleted remotely, sync confirmed)
          // - If local doesn't have deletedAt → keep it (might be new, not yet synced)
          const merged = Array.from(localMap.values()).filter((item) =>
          {
            if (remoteIds.has(item.id))
            {
              return true; // Item exists in remote, keep it
            }
            // Item not in remote
            if (item.deletedAt !== undefined)
            {
              return false; // Was marked for deletion, now confirmed deleted remotely
            }
            // Item not in remote but not marked for deletion - might be new, keep it
            return true;
          });

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
