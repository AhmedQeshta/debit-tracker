import { selectDashboardStats, selectPendingCount } from '@/lib/dashboardSelectors';
import { getBalance, RANGE_OPTIONS } from '@/lib/utils';
import { subscribeToNetwork } from '@/services/net';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { Budget, Friend } from '@/types/models';
import { useCallback, useEffect, useMemo, useState } from 'react';

type DashboardRange = 'week' | 'month' | 'all';

type DebtItem = {
  friend: Friend;
  balance: number;
};

type BudgetSnapshot = {
  budget: Budget;
  spent: number;
  remaining: number;
  percentUsed: number;
};

export const useDashboard = (summaryCurrency: string) => {
  const [isOnline, setIsOnline] = useState(true);
  const [selectedRange, setSelectedRange] = useState<DashboardRange>('month');

  // Use selectors for all stats - single source of truth
  const stats = selectDashboardStats();
  const pendingCount = selectPendingCount();

  const { unpinFriend } = useFriendsStore();
  const { unpinBudget, getTotalSpent, getRemainingBudget } = useBudgetStore();

  const rangeStart = useMemo(() => {
    const now = Date.now();
    if (selectedRange === 'week') return now - 7 * 24 * 60 * 60 * 1000;
    if (selectedRange === 'month') return now - 30 * 24 * 60 * 60 * 1000;
    return 0;
  }, [selectedRange]);

  const transactionsInRange = useMemo(() => {
    if (selectedRange === 'all') return stats.transactions;
    return stats.transactions.filter((transaction) => transaction.date >= rangeStart);
  }, [rangeStart, selectedRange, stats.transactions]);

  const transactionsInSummaryCurrency = useMemo(
    () =>
      transactionsInRange.filter((transaction) => {
        const friend = stats.friends.find((item) => item.id === transaction.friendId);
        return (friend?.currency || '$') === summaryCurrency;
      }),
    [stats.friends, summaryCurrency, transactionsInRange],
  );

  const summaryStats = useMemo(() => {
    const activeFriends = stats.friends.filter(
      (friend) => (friend.currency || '$') === summaryCurrency,
    );
    const balances = activeFriends.map((friend) => getBalance(friend.id, transactionsInRange));

    const youOweTotal = balances
      .filter((value) => value < 0)
      .reduce((total, value) => total + Math.abs(value), 0);

    const owedToYouTotal = balances
      .filter((value) => value > 0)
      .reduce((total, value) => total + value, 0);

    const settledCount = balances.filter((value) => value === 0).length;
    const netBalanceTotal = balances.reduce((total, value) => total + value, 0);

    return {
      totalFriends: activeFriends.length,
      youOweTotal,
      owedToYouTotal,
      settledCount,
      netBalance: netBalanceTotal,
    };
  }, [stats.friends, summaryCurrency, transactionsInRange]);

  const youOwe = summaryStats.youOweTotal;
  const owedToYou = summaryStats.owedToYouTotal;
  const netBalance = summaryStats.netBalance;

  const weekDelta = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return transactionsInSummaryCurrency
      .filter((transaction) => transaction.date >= sevenDaysAgo)
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactionsInSummaryCurrency]);

  const trendText = weekDelta > 0 ? 'Up this week' : weekDelta < 0 ? 'Down this week' : 'Stable';

  const debtItems = useMemo<DebtItem[]>(
    () =>
      stats.friends
        .map((friend) => ({
          friend,
          balance: getBalance(friend.id, transactionsInRange),
        }))
        .filter((item) => item.balance !== 0)
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)),
    [stats.friends, transactionsInRange],
  );

  const peopleYouOwe = useMemo(
    () => debtItems.filter((item) => item.balance < 0).slice(0, 3),
    [debtItems],
  );
  const peopleWhoOweYou = useMemo(
    () => debtItems.filter((item) => item.balance > 0).slice(0, 3),
    [debtItems],
  );

  const activeBudgets = useMemo(
    () => stats.budgets.filter((budget) => !budget.archivedAt),
    [stats.budgets],
  );

  const budgetSnapshots = useMemo<BudgetSnapshot[]>(() => {
    return activeBudgets
      .map((budget) => {
        const spent = getTotalSpent(budget.id);
        const remaining = getRemainingBudget(budget.id);
        const percentUsed = budget.totalBudget > 0 ? (spent / budget.totalBudget) * 100 : 0;

        return {
          budget,
          spent,
          remaining,
          percentUsed,
        };
      })
      .sort((a, b) => b.percentUsed - a.percentUsed);
  }, [activeBudgets, getRemainingBudget, getTotalSpent]);

  const budgetsNearLimit = useMemo(
    () => budgetSnapshots.filter((item) => item.percentUsed >= 90).length,
    [budgetSnapshots],
  );

  const budgetSnapshot = useMemo(() => budgetSnapshots.slice(0, 3), [budgetSnapshots]);

  const rangeLabel = useMemo(() => {
    if (selectedRange === 'week') return 'This week';
    if (selectedRange === 'month') return 'This month';
    return 'All time';
  }, [selectedRange]);

  const isFreshState =
    stats.friends.length === 0 && stats.transactions.length === 0 && activeBudgets.length === 0;

  useEffect(() => {
    const unsubscribe = subscribeToNetwork((connected) => {
      setIsOnline(connected);
    });
    return () => unsubscribe();
  }, []);

  const getFriendBalance = useCallback(
    (friendId: string) => getBalance(friendId, stats.transactions),
    [stats.transactions],
  );

  const getBudgetTotalSpent = useCallback(
    (budgetId: string) => getTotalSpent(budgetId),
    [getTotalSpent],
  );

  const getBudgetRemaining = useCallback(
    (budgetId: string) => getRemainingBudget(budgetId),
    [getRemainingBudget],
  );

  const handleUnpin = (friendId: string, e: any) => {
    e.stopPropagation();
    unpinFriend(friendId);
  };

  const handleUnpinBudget = (budgetId: string, e: any) => {
    e.stopPropagation();
    unpinBudget(budgetId);
  };

  const insightItems: { label: string; value: string; emphasize?: boolean }[] = [
    { label: 'Total friends', value: String(stats.friends.length) },
    { label: 'Pending syncs', value: String(pendingCount), emphasize: pendingCount > 0 },
  ];

  const handleRangeChipPress = () => {
    const currentIndex = RANGE_OPTIONS.findIndex((range) => range.key === selectedRange);
    const nextIndex = currentIndex === RANGE_OPTIONS.length - 1 ? 0 : currentIndex + 1;
    setSelectedRange(RANGE_OPTIONS[nextIndex].key);
  };

  if (activeBudgets.length > 0) {
    insightItems.push({
      label: 'Budgets near limit',
      value: String(budgetsNearLimit),
      emphasize: budgetsNearLimit > 0,
    });
  }

  return {
    isOnline,
    globalDebit: stats.totalDebit,
    totalPaidBack: stats.totalPaidBack,
    youOwe,
    owedToYou,
    netBalance,
    summaryStats,
    trendText,
    selectedRange,
    setSelectedRange,
    rangeLabel,
    peopleYouOwe,
    peopleWhoOweYou,
    budgetSnapshot,
    activeBudgetCount: activeBudgets.length,
    isFreshState,
    pinnedFriends: stats.pinnedFriends,
    pinnedCount: stats.pinnedFriends.length,
    pinnedBudgets: stats.pinnedBudgets,
    pinnedBudgetCount: stats.pinnedBudgets.length,
    getFriendBalance,
    getBudgetTotalSpent,
    getBudgetRemaining,
    handleUnpin,
    handleUnpinBudget,
    handleRangeChipPress,
    insightItems,
  };
};
