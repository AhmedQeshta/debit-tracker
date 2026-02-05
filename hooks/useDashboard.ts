import { getBalance } from '@/lib/utils';
import { selectDashboardStats, selectPendingCount } from '@/selectors/dashboardSelectors';
import { subscribeToNetwork } from '@/services/net';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export const useDashboard = () =>
{
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  // Use selectors for all stats - single source of truth
  const stats = selectDashboardStats();
  const pendingCount = selectPendingCount();

  const { unpinFriend } = useFriendsStore();
  const { unpinBudget, getTotalSpent, getRemainingBudget } = useBudgetStore();

  useEffect(() =>
  {
    const unsubscribe = subscribeToNetwork((connected) =>
    {
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

  const handleUnpin = (friendId: string, e: any) =>
  {
    e.stopPropagation();
    unpinFriend(friendId);
  };

  const handleUnpinBudget = (budgetId: string, e: any) =>
  {
    e.stopPropagation();
    unpinBudget(budgetId);
  };

  return {
    friends: stats.friends,
    queueSize: pendingCount,
    isOnline,
    globalDebit: stats.totalDebit,
    totalPaidBack: stats.totalPaidBack,
    pinnedFriends: stats.pinnedFriends,
    pinnedCount: stats.pinnedFriends.length,
    pinnedBudgets: stats.pinnedBudgets,
    pinnedBudgetCount: stats.pinnedBudgets.length,
    getFriendBalance,
    getBudgetTotalSpent,
    getBudgetRemaining,
    handleUnpin,
    handleUnpinBudget,
    router,
  };
};
