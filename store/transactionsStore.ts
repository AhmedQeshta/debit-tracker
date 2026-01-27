import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types/models';

interface TransactionsState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
  markAsSynced: (id: string) => void;
}

export const useTransactionsStore = create<TransactionsState>()(
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
