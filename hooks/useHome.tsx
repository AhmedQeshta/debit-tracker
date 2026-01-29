import { calculateLatestTransactions, getBalance } from "@/lib/utils";
import { useMemo } from "react";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useShallow } from "zustand/react/shallow";
import { Alert } from "react-native";

export const useHome = () => {
  const allUsers = useUsersStore(useShallow((state) => state.users));
  const { pinUser, unpinUser } = useUsersStore();
  
  const latestUsers = useMemo(() => {
    // Sort: pinned first, then by createdAt (most recent first)
    const sorted = [...allUsers].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
    return sorted.slice(0, 5);
  }, [allUsers]);

  const allTransactions = useTransactionsStore(useShallow((state) => state.transactions));

  const latestTransactions = useMemo(
    () => calculateLatestTransactions(allTransactions),
    [allTransactions]
  );

  const getUserBalance = useMemo(
    () => (userId: string) => getBalance(userId, allTransactions),
    [allTransactions]
  );

  const handlePinToggle = (userId: string) => {
    const user = latestUsers.find((u) => u.id === userId);
    if (user) {
      if (user.pinned) {
        unpinUser(userId);
      } else {
        pinUser(userId);
      }
    }
  };

  const allBudgets = useBudgetStore(useShallow((state) => state.budgets));
  const { getTotalSpent, getRemainingBudget, pinBudget, unpinBudget, deleteBudget } = useBudgetStore();

  const latestBudgets = useMemo(() => {
    // Sort by createdAt (most recent first)
    const sorted = [...allBudgets].sort((a, b) => b.createdAt - a.createdAt);
    return sorted.slice(0, 5);
  }, [allBudgets]);

  const getBudgetTotalSpent = useMemo(
    () => (budgetId: string) => getTotalSpent(budgetId),
    [getTotalSpent]
  );

  const getBudgetRemaining = useMemo(
    () => (budgetId: string) => getRemainingBudget(budgetId),
    [getRemainingBudget]
  );

  const handleBudgetPinToggle = (budgetId: string) => {
    const budget = allBudgets.find((b) => b.id === budgetId);
    if (budget) {
      if (budget.pinned) {
        unpinBudget(budgetId);
      } else {
        pinBudget(budgetId);
      }
    }
  };

  const handleBudgetDelete = (budgetId: string, title: string) => {
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
    latestTransactions,
    getUserBalance,
    latestUsers,
    handlePinToggle,
    latestBudgets,
    getBudgetTotalSpent,
    getBudgetRemaining,
    handleBudgetPinToggle,
    handleBudgetDelete,
  };
};