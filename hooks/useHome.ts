import { calculateLatestTransactions, getBalance } from "@/lib/utils";
import { useMemo } from "react";
import { useTransactionsStore } from "@/store/transactionsStore";
import { useUsersStore } from "@/store/usersStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useSyncStore } from "@/store/syncStore";
import { useShallow } from "zustand/react/shallow";
import { useRouter } from "expo-router";
import { confirmDelete } from "@/lib/alert";
import { useNavigation } from "./useNavigation";

export const useHome = () =>
{
  const { deleteUser } = useUsersStore();
  const { deleteTransaction } = useTransactionsStore();
  const { addToQueue } = useSyncStore();

  const allUsers = useUsersStore(useShallow((state) => state.users));
  const { pinUser, unpinUser } = useUsersStore();

  const latestUsers = useMemo(() => [...allUsers].sort((a, b) => a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : b.createdAt - a.createdAt).slice(0, 5), [allUsers]);

  const allTransactions = useTransactionsStore(useShallow((state) => state.transactions));

  const latestTransactions = useMemo(
    () => calculateLatestTransactions(allTransactions),
    [allTransactions]
  );

  const getUserBalance = useMemo(
    () => (userId: string) => getBalance(userId, allTransactions),
    [allTransactions]
  );

  const handlePinToggle = (userId: string) =>
  {
    const user = latestUsers.find((u) => u.id === userId);
    if (user) user.pinned ? unpinUser(userId) : pinUser(userId);
  };

  const allBudgets = useBudgetStore(useShallow((state) => state.budgets));
  const { getTotalSpent, getRemainingBudget, pinBudget, unpinBudget, deleteBudget } = useBudgetStore();

  const latestBudgets = useMemo(() => [...allBudgets].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5), [allBudgets]);

  const getBudgetTotalSpent = useMemo(
    () => (budgetId: string) => getTotalSpent(budgetId),
    [getTotalSpent]
  );

  const getBudgetRemaining = useMemo(
    () => (budgetId: string) => getRemainingBudget(budgetId),
    [getRemainingBudget]
  );

  const handleBudgetPinToggle = (budgetId: string) =>
  {
    const budget = allBudgets.find((b) => b.id === budgetId);
    if (budget) budget.pinned ? unpinBudget(budgetId) : pinBudget(budgetId);
  };

  const handleBudgetDelete = (budgetId: string, title: string) =>
  {
    confirmDelete(
      "Delete Budget",
      `Are you sure you want to delete "${title}"?`,
      () =>  deleteBudget(budgetId)
    );
  };


  const handleUserEdit = (userId: string) =>
  {
    const { navigateToUserEdit } = useNavigation();
    navigateToUserEdit(userId);
  };

  const handleUserDelete = (userId: string, userName: string) =>
  {
    const userTransactions = useTransactionsStore.getState().transactions.filter(
      (t) => t.userId === userId
    );

    confirmDelete(
      'Delete User',
      `Are you sure you want to delete "${userName}" and all records?`,
      () =>
      {
        // Delete all transactions for this user
        userTransactions.forEach((t) =>
        {
          deleteTransaction(t.id);
          addToQueue({
            id: Math.random().toString(36).substring(7),
            type: 'transaction',
            action: 'delete',
            payload: { id: t.id },
          });
        });

        // Delete the user
        deleteUser(userId);
        addToQueue({
          id: Math.random().toString(36).substring(7),
          type: 'user',
          action: 'delete',
          payload: { id: userId },
        });
      }
    );
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
    handleUserEdit,
    handleUserDelete,
  };
};