import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetItem, Budget } from '../types/models';
import { IBudgetState } from '@/types/store';

export const useBudgetStore = create<IBudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      addBudget: (title: string, currency: string, totalBudget: number) => {
        const newBudget: Budget = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title,
          currency,
          totalBudget,
          items: [],
          pinned: false,
          createdAt: Date.now(),
        };
        set((state) => ({ budgets: [newBudget, ...state.budgets] }));
        return newBudget.id;
      },
      updateBudget: (id: string, updates: Partial<Budget>) =>
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),
      deleteBudget: (id: string) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),
      pinBudget: (id: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, pinned: true } : b)),
        })),
      unpinBudget: (id: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, pinned: false } : b)),
        })),
      setCurrency: (id: string, currency: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, currency } : b)),
        })),
      setTotalBudget: (id: string, amount: number) =>
        set((state) => ({
          budgets: state.budgets.map((b) => (b.id === id ? { ...b, totalBudget: amount } : b)),
        })),
      addItem: (budgetId: string, title: string, amount: number) => {
        const newItem: BudgetItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title,
          amount,
          createdAt: Date.now(),
        };
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId ? { ...b, items: [newItem, ...b.items] } : b,
          ),
        }));
      },
      removeItem: (budgetId: string, itemId: string) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === budgetId ? { ...b, items: b.items.filter((item) => item.id !== itemId) } : b,
          ),
        })),
      getTotalSpent: (budgetId: string) => {
        const budget = get().budgets.find((b) => b.id === budgetId);
        if (!budget) return 0;
        return budget.items.reduce((sum, item) => sum + item.amount, 0);
      },
      getRemainingBudget: (budgetId: string) => {
        const budget = get().budgets.find((b) => b.id === budgetId);
        if (!budget) return 0;
        const totalSpent = get().getTotalSpent(budgetId);
        return budget.totalBudget - totalSpent;
      },
      getBudget: (id: string) => {
        return get().budgets.find((b) => b.id === id);
      },
    }),
    {
      name: 'budget-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
