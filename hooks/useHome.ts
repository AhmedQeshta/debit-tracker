import { useBudgetPeriod } from '@/hooks/budget/useBudgetPeriod';
import { useSettle } from '@/hooks/friend/useSettle';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { calculateLatestTransactions, getBalance } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { HomeBudgetPreview, HomeSettlePerson, HomeSummaryMetrics } from '@/types/common';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useNavigation } from './useNavigation';

export const useHome = (summaryCurrency: string) => {
  const { t } = useTranslation();
  const { deleteFriend, pinFriend, unpinFriend } = useFriendsStore();
  const { deleteTransaction } = useTransactionsStore();
  const { navigateToFriendEdit } = useNavigation();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow } = useCloudSync();
  const { mutate } = useSyncMutation();
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

  const handlePinToggle = async (friendId: string): Promise<void> => {
    const friend = latestFriends.find((f) => f.id === friendId);
    if (friend) {
      const nextPinned = !friend.pinned;
      if (friend.pinned) unpinFriend(friendId);
      else pinFriend(friendId);

      await mutate('friend_pin', 'update', {
        id: friendId,
        friendId,
        pinned: nextPinned,
        updatedAt: Date.now(),
      });
    }
  };

  const allBudgets = useBudgetStore(
    useShallow((state) => state.budgets.filter((b) => !b.deletedAt)),
  );
  const {
    getTotalSpent,
    getRemainingBudget,
    getBudgetMetrics,
    pinBudget,
    unpinBudget,
    deleteBudget,
  } = useBudgetStore();
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
      trend === 'up'
        ? t('dashboardHooks.trend.upThisWeek')
        : trend === 'down'
          ? t('dashboardHooks.trend.downThisWeek')
          : t('dashboardHooks.trend.stable');

    return {
      netBalance,
      youOwe,
      owedToYou,
      trend,
      trendText,
    };
  }, [activeFriends, allTransactions, summaryCurrency]);

  const settleUpPeople = useMemo<HomeSettlePerson[]>(() => {
    const lastTransactionByFriend = new Map<string, number>();
    allTransactions.forEach((transaction) => {
      const currentLast = lastTransactionByFriend.get(transaction.friendId) || 0;
      const transactionDate = transaction.date || transaction.createdAt || 0;
      if (transactionDate > currentLast) {
        lastTransactionByFriend.set(transaction.friendId, transactionDate);
      }
    });

    return activeFriends
      .map((friend) => {
        const balance = getBalance(friend.id, allTransactions);
        const lastTransactionDate = lastTransactionByFriend.get(friend.id) || 0;
        return { friend, balance, lastTransactionDate };
      })
      .filter((item) => item.balance !== 0)
      .sort((a, b) => {
        const aPinned = Boolean(a.friend.pinned);
        const bPinned = Boolean(b.friend.pinned);

        if (aPinned !== bPinned) {
          return aPinned ? -1 : 1;
        }

        const actionDelta = Math.abs(b.balance) - Math.abs(a.balance);
        if (actionDelta !== 0) return actionDelta;

        const activityDelta = b.lastTransactionDate - a.lastTransactionDate;
        if (activityDelta !== 0) return activityDelta;

        return a.friend.name.localeCompare(b.friend.name);
      })
      .map(({ friend, balance }) => ({ friend, balance }))
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
    const sortedBudgets = [...activeBudgets].sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      const aMetrics = getBudgetMetrics(a.id);
      const bMetrics = getBudgetMetrics(b.id);

      if (aMetrics.isOverspent !== bMetrics.isOverspent) {
        return aMetrics.isOverspent ? -1 : 1;
      }

      const aProgress = a.totalBudget > 0 ? aMetrics.netSpent / a.totalBudget : 0;
      const bProgress = b.totalBudget > 0 ? bMetrics.netSpent / b.totalBudget : 0;
      if (aProgress !== bProgress) {
        return bProgress - aProgress;
      }

      const updatedAtDelta = (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
      if (updatedAtDelta !== 0) return updatedAtDelta;

      return a.title.localeCompare(b.title);
    });

    return sortedBudgets.slice(0, 5).map((budget) => {
      const spent = getTotalSpent(budget.id);
      const progressRatio = budget.totalBudget > 0 ? spent / budget.totalBudget : 0;
      const progress = Math.max(0, Math.min(1, progressRatio));

      let warningLabel: string | null = null;
      if (progressRatio >= 1) warningLabel = t('homeHooks.budget.warningOverLimit');
      else if (progressRatio >= 0.8) warningLabel = t('budgetCard.status.nearLimit');

      return {
        budget,
        spent,
        progress,
        warningLabel,
      };
    });
  }, [activeBudgets, getBudgetMetrics, getTotalSpent, t]);

  const isFreshState =
    activeFriends.length === 0 && allTransactions.length === 0 && activeBudgets.length === 0;

  const handleBudgetPinToggle = async (budgetId: string): Promise<void> => {
    const budget = allBudgets.find((b) => b.id === budgetId);
    if (budget) {
      const nextPinned = !budget.pinned;
      if (budget.pinned) unpinBudget(budgetId);
      else pinBudget(budgetId);

      await mutate('budget_pin', 'update', {
        id: budgetId,
        budgetId,
        pinned: nextPinned,
        updatedAt: Date.now(),
      });
    }
  };

  const handleBudgetDelete = (budgetId: string, title: string) => {
    showConfirm(
      t('budgetHooks.deleteBudget.confirmTitle'),
      t('budgetHooks.deleteBudget.confirmMessage', { title }),
      async () => {
        deleteBudget(budgetId);
        toastSuccess(t('budgetHooks.deleteBudget.success'));

        // Trigger sync to push deletion to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: t('common.actions.delete') },
    );
  };

  const handleFriendEdit = (friendId: string) => {
    navigateToFriendEdit(friendId);
  };

  const handleFriendDelete = (friendId: string, friendName: string) => {
    showConfirm(
      t('friendHooks.detail.deleteFriend.confirmTitle'),
      t('friendHooks.detail.deleteFriend.confirmMessage', { name: friendName }),
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
        toastSuccess(t('friendHooks.detail.deleteFriend.success'));

        // Trigger sync to push deletions to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: t('common.actions.delete') },
    );
  };

  const handleTransactionDelete = (id: string) => {
    const transaction = useTransactionsStore.getState().transactions.find((t) => t.id === id);
    if (!transaction) return;

    showConfirm(
      t('friendHooks.detail.deleteTransaction.confirmTitle'),
      t('friendHooks.detail.deleteTransaction.confirmMessage', { title: transaction.title }),
      async () => {
        // Delete transaction (store handles sync tracking automatically)
        deleteTransaction(id);
        toastSuccess(t('friendHooks.detail.deleteTransaction.success'));

        // Trigger sync to push deletion to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: t('common.actions.delete') },
    );
  };

  const handleAddTransactionPress = () => {
    if (allFriends.length > 0) {
      navigateToCreateTransaction();
      return;
    }

    showConfirm(
      t('transactions.empty.addFriendFirst'),
      t('transactionHooks.empty.addFriendRequiredMessage'),
      () => navigateToCreateFriend(),
      {
        confirmText: t('transactions.actions.addFriend'),
        cancelText: t('transactionHooks.actions.later'),
      },
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
