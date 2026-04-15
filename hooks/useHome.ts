import { useBudgetPeriod } from '@/hooks/budget/useBudgetPeriod';
import { useSettle } from '@/hooks/friend/useSettle';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { calculateLatestTransactions, getBalance } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { HomeBudgetPreview, HomeSettlePerson, HomeSummaryMetrics } from '@/types/common';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useNavigation } from './useNavigation';

export const useHome = (summaryCurrency: string) => {
  const { deleteFriend, pinFriend, unpinFriend } = useFriendsStore();
  const { deleteTransaction } = useTransactionsStore();
  const { navigateToFriendEdit } = useNavigation();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow } = useCloudSync();
  const { handleBudgetResetPeriod } = useBudgetPeriod();
  const { handleSettleUp, isSettling: isSettlingFriend, canSettle: canSettleFriend } = useSettle();

  const {
    navigateToBudgetEdit,
    navigateToTransactionEdit,
    navigateToCreateBudget,
    navigateToCreateFriend,
    navigateToCreateTransaction,
  } = useNavigation();

  const allFriends = useFriendsStore(
    useShallow((state) => state.friends.filter((f) => !f.deletedAt)),
  );

  const latestFriends = useMemo(
    () =>
      [...allFriends]
        .sort((a, b) =>
          a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : b.createdAt - a.createdAt,
        )
        .slice(0, 5),
    [allFriends],
  );

  const allTransactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => !t.deletedAt)),
  );

  const activeFriends = useMemo(
    () => allFriends.filter((friend) => !friend.deletedAt),
    [allFriends],
  );

  const latestTransactions = useMemo(
    () => calculateLatestTransactions(allTransactions),
    [allTransactions],
  );

  const getFriendBalance = useMemo(
    () => (friendId: string) => getBalance(friendId, allTransactions),
    [allTransactions],
  );

  const handlePinToggle = (friendId: string) => {
    const friend = latestFriends.find((f) => f.id === friendId);
    if (friend) {
      if (friend.pinned) unpinFriend(friendId);
      else pinFriend(friendId);
    }
  };

  const allBudgets = useBudgetStore(
    useShallow((state) => state.budgets.filter((b) => !b.deletedAt)),
  );
  const { getTotalSpent, getRemainingBudget, pinBudget, unpinBudget, deleteBudget } =
    useBudgetStore();
  const activeBudgets = useMemo(
    () => allBudgets.filter((budget) => !budget.deletedAt && !budget.archivedAt),
    [allBudgets],
  );

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

  const summary = useMemo<HomeSummaryMetrics>(() => {
    const transactionsInCurrency = allTransactions.filter((transaction) => {
      const friend = activeFriends.find((item) => item.id === transaction.friendId);
      return (friend?.currency || '$') === summaryCurrency;
    });

    const youOwe = transactionsInCurrency
      .filter((transaction) => transaction.amount < 0)
      .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);

    const owedToYou = transactionsInCurrency
      .filter((transaction) => transaction.amount > 0)
      .reduce((total, transaction) => total + transaction.amount, 0);

    const netBalance = owedToYou - youOwe;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekDelta = transactionsInCurrency
      .filter((transaction) => transaction.date >= sevenDaysAgo)
      .reduce((total, transaction) => total + transaction.amount, 0);

    const trend = weekDelta > 0 ? 'up' : weekDelta < 0 ? 'down' : 'flat';
    const trendText =
      trend === 'up' ? 'Up this week' : trend === 'down' ? 'Down this week' : 'Stable';

    return {
      netBalance,
      youOwe,
      owedToYou,
      trend,
      trendText,
    };
  }, [activeFriends, allTransactions, summaryCurrency]);

  const settleUpPeople = useMemo<HomeSettlePerson[]>(() => {
    return activeFriends
      .map((friend) => {
        const balance = getBalance(friend.id, allTransactions);
        return { friend, balance };
      })
      .filter((item) => item.balance !== 0)
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
      .slice(0, 3);
  }, [activeFriends, allTransactions]);

  const recentTransactions = useMemo(() => {
    const friendsById = new Map(activeFriends.map((friend) => [friend.id, friend]));
    return latestTransactions.slice(0, 5).map((transaction) => ({
      transaction,
      friend: friendsById.get(transaction.friendId),
    }));
  }, [activeFriends, latestTransactions]);

  const budgetsOverview = useMemo<HomeBudgetPreview[]>(() => {
    return activeBudgets.slice(0, 5).map((budget) => {
      const spent = getTotalSpent(budget.id);
      const progressRatio = budget.totalBudget > 0 ? spent / budget.totalBudget : 0;
      const progress = Math.max(0, Math.min(1, progressRatio));

      let warningLabel: string | null = null;
      if (progressRatio >= 1) warningLabel = 'Over limit';
      else if (progressRatio >= 0.8) warningLabel = 'Near limit';

      return {
        budget,
        spent,
        progress,
        warningLabel,
      };
    });
  }, [activeBudgets, getTotalSpent]);

  const isFreshState =
    activeFriends.length === 0 && allTransactions.length === 0 && activeBudgets.length === 0;

  const handleBudgetPinToggle = (budgetId: string) => {
    const budget = allBudgets.find((b) => b.id === budgetId);
    if (budget) {
      if (budget.pinned) unpinBudget(budgetId);
      else pinBudget(budgetId);
    }
  };

  const handleBudgetDelete = (budgetId: string, title: string) => {
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
      { confirmText: 'Delete' },
    );
  };

  const handleFriendEdit = (friendId: string) => {
    navigateToFriendEdit(friendId);
  };

  const handleFriendDelete = (friendId: string, friendName: string) => {
    showConfirm(
      'Delete Friend',
      `Are you sure you want to delete "${friendName}"? This will also delete all associated transactions.`,
      async () => {
        // Delete all transactions for this friend first (get all, including already deleted ones)
        const allFriendTransactions = useTransactionsStore
          .getState()
          .transactions.filter((t) => t.friendId === friendId);

        allFriendTransactions.forEach((t) => {
          // Only delete if not already marked for deletion
          if (!t.deletedAt) {
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
      { confirmText: 'Delete' },
    );
  };

  const handleTransactionDelete = (id: string) => {
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
      { confirmText: 'Delete' },
    );
  };

  const handleAddTransactionPress = () => {
    if (allFriends.length > 0) {
      navigateToCreateTransaction();
      return;
    }

    showConfirm(
      'Add a friend first',
      'You need at least one friend before adding a transaction.',
      () => navigateToCreateFriend(),
      { confirmText: 'Add Friend', cancelText: 'Later' },
    );
  };

  const summaryStats = useMemo(() => {
    const activeFriends = allFriends.filter(
      (friend) => (friend.currency || '$') === summaryCurrency,
    );
    const balances = activeFriends.map((friend) => getBalance(friend.id, allTransactions));

    const youOweTotal = balances
      .filter((value) => value < 0)
      .reduce((total, value) => total + Math.abs(value), 0);

    const owedToYouTotal = balances
      .filter((value) => value > 0)
      .reduce((total, value) => total + value, 0);

    const settledCount = balances.filter((value) => value === 0).length;
    const netBalance = balances.reduce((total, value) => total + value, 0);

    return {
      totalFriends: activeFriends.length,
      youOweTotal,
      owedToYouTotal,
      settledCount,
      netBalance,
    };
  }, [allFriends, allTransactions, summaryCurrency]);

  return {
    allBudgets: activeBudgets,
    summary,
    settleUpPeople,
    recentTransactions,
    budgetsOverview,
    isFreshState,
    handleFriendEdit,
    handleFriendDelete,
    navigateToTransactionEdit,
    handleTransactionDelete,
    handleBudgetDelete,
    handleBudgetPinToggle,
    navigateToBudgetEdit,
    handleBudgetResetPeriod,
    handlePinToggle,
    latestFriends,
    getFriendBalance,
    latestBudgets,
    getBudgetTotalSpent,
    getBudgetRemaining,
    navigateToCreateBudget,
    navigateToCreateFriend,
    handleAddTransactionPress,
    handleSettleUp,
    isSettlingFriend,
    canSettleFriend,
    summaryStats,
  };
};
