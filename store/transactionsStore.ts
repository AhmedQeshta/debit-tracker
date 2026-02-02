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
          const localMap = new Map(state.transactions.map((t) => [t.id, t]));
          remoteTransactions.forEach((remote) => {
            const local = localMap.get(remote.id);
            if (!local || (remote.updatedAt || 0) > (local.updatedAt || 0)) {
              localMap.set(remote.id, { ...remote, synced: true });
            }
          });
          return { transactions: Array.from(localMap.values()) };
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
