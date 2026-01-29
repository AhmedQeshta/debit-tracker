import { Alert } from 'react-native';
import { useBudgetStore } from '@/store/budgetStore';
import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';

export const useBudgetList = () => {
  const { openDrawer } = useDrawerContext();
  const router = useRouter();
  const budgets = useBudgetStore(useShallow((state) => state.budgets));
  const { pinBudget, unpinBudget, deleteBudget, getTotalSpent, getRemainingBudget } = useBudgetStore();

  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [budgets]);

  const handlePinToggle = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (budget) {
      if (budget.pinned) {
        unpinBudget(budgetId);
      } else {
        pinBudget(budgetId);
      }
    }
  };

  const handleDelete = (budgetId: string, title: string) => {
    Alert.alert('Delete Budget', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteBudget(budgetId),
      },
    ]);
  };

  return {
    budgets,
    sortedBudgets,
    handlePinToggle,
    handleDelete,
    router,
    openDrawer,
    pinBudget,
    unpinBudget,
    deleteBudget,
    getTotalSpent,
    getRemainingBudget, 
  }
}