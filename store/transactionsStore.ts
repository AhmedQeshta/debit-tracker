import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ITransactionsState } from '@/types/store';



export const useTransactionsStore = create<ITransactionsState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({ transactions: [transaction, ...state.transactions] })),
      updateTransaction: (updatedTransaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === updatedTransaction.id ? updatedTransaction : t,
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
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
