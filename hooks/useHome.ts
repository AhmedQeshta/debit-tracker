import { calculateLatestTransactions, getBalance } from '@/lib/utils';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useShallow } from 'zustand/react/shallow';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { useToast } from '@/contexts/ToastContext';
import { useNavigation } from './useNavigation';
import { useCloudSync } from '@/hooks/sync/useCloudSync';

export const useHome = () =>
{
  const { deleteFriend, pinFriend, unpinFriend } = useFriendsStore();
  const { deleteTransaction } = useTransactionsStore();
  const { navigateToFriendEdit } = useNavigation();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow } = useCloudSync();
  const router = useRouter();

  const allFriends = useFriendsStore(useShallow((state) => state.friends.filter((f) => !f.deletedAt)));

  const latestFriends = useMemo(
    () =>
      [...allFriends]
        .sort((a, b) =>
          a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : b.createdAt - a.createdAt,
        )
        .slice(0, 5),
    [allFriends],
  );

  const allTransactions = useTransactionsStore(useShallow((state) => state.transactions.filter((t) => !t.deletedAt)));

  const latestTransactions = useMemo(
    () => calculateLatestTransactions(allTransactions),
    [allTransactions],
  );

  const getFriendBalance = useMemo(
    () => (friendId: string) => getBalance(friendId, allTransactions),
    [allTransactions],
  );

  const handlePinToggle = (friendId: string) =>
  {
    const friend = latestFriends.find((f) => f.id === friendId);
    if (friend)
    {
      if (friend.pinned) unpinFriend(friendId);
      else pinFriend(friendId);
    }
  };

  const allBudgets = useBudgetStore(useShallow((state) => state.budgets.filter((b) => !b.deletedAt)));
  const { getTotalSpent, getRemainingBudget, pinBudget, unpinBudget, deleteBudget } =
    useBudgetStore();

  const latestBudgets = useMemo(
    () => [...allBudgets].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    [allBudgets],
  );

  const getBudgetTotalSpent = useMemo(
    () => (budgetId: string) => getTotalSpent(budgetId),
    [getTotalSpent],
  );

  const getBudgetRemaining = useMemo(
    () => (budgetId: string) => getRemainingBudget(budgetId),
    [getRemainingBudget],
  );

  const handleBudgetPinToggle = (budgetId: string) =>
  {
    const budget = allBudgets.find((b) => b.id === budgetId);
    if (budget)
    {
      if (budget.pinned) unpinBudget(budgetId);
      else pinBudget(budgetId);
    }
  };

  const handleBudgetDelete = (budgetId: string, title: string) =>
  {
    showConfirm(
      'Delete Budget',
      `Are you sure you want to delete "${title}"?`,
      async () => {
        deleteBudget(budgetId);
        toastSuccess('Budget deleted successfully');
        
        // Trigger sync to push deletion to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: 'Delete' }
    );
  };

  const handleFriendEdit = (friendId: string) =>
  {
    navigateToFriendEdit(friendId);
  };

  const handleFriendDelete = (friendId: string, friendName: string) =>
  {
    showConfirm(
      'Delete Friend',
      `Are you sure you want to delete "${friendName}"? This will also delete all associated transactions.`,
      async () => {
        // Delete all transactions for this friend first (get all, including already deleted ones)
        const allFriendTransactions = useTransactionsStore
          .getState()
          .transactions.filter((t) => t.friendId === friendId);

        allFriendTransactions.forEach((t) =>
        {
          // Only delete if not already marked for deletion
          if (!t.deletedAt)
          {
            deleteTransaction(t.id);
          }
        });

        // Delete the friend (stores handle sync tracking automatically)
        deleteFriend(friendId);
        toastSuccess('Friend deleted successfully');
        
        // Trigger sync to push deletions to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: 'Delete' }
    );
  };

  const handleTransactionEdit = (id: string) =>
  {
    router.push(`/(drawer)/transaction/${id}/edit`);
  };

  const handleTransactionDelete = (id: string) =>
  {
    const transaction = useTransactionsStore.getState().transactions.find((t) => t.id === id);
    if (!transaction) return;

    showConfirm(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.title}"?`,
      async () => {
        // Delete transaction (store handles sync tracking automatically)
        deleteTransaction(id);
        toastSuccess('Transaction deleted successfully');
        
        // Trigger sync to push deletion to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: 'Delete' }
    );
  };

  return {
    latestTransactions,
    getFriendBalance,
    latestFriends,
    handlePinToggle,
    latestBudgets,
    getBudgetTotalSpent,
    getBudgetRemaining,
    handleBudgetPinToggle,
    handleBudgetDelete,
    handleFriendEdit,
    handleFriendDelete,
    handleTransactionEdit,
    handleTransactionDelete,
  };
};
