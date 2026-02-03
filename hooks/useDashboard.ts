import { getGlobalDebit, getTotalPaidBack, getBalance } from '@/lib/utils';
import { subscribeToNetwork } from '@/services/net';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const useDashboard = () =>
{
  const friends = useFriendsStore(useShallow((state) => state.friends));
  const transactions = useTransactionsStore(useShallow((state) => state.transactions));
  const budgets = useBudgetStore(useShallow((state) => state.budgets));
  const [isOnline, setIsOnline] = useState(true);

  // Calculate actual pending syncs from dirty items (items with synced: false)
  const queueSize = useMemo(() =>
  {
    const dirtyFriends = friends.filter((f) => f.synced === false);
    const dirtyTransactions = transactions.filter((t) => t.synced === false);
    const dirtyBudgets = budgets.filter((b) => b.synced === false);

    // Count dirty budget items
    const dirtyBudgetItems = budgets.reduce((count, budget) =>
    {
      const dirtyItems = budget.items.filter((item) => item.synced === false);
      return count + dirtyItems.length;
    }, 0);

    return dirtyFriends.length + dirtyTransactions.length + dirtyBudgets.length + dirtyBudgetItems;
  }, [friends, transactions, budgets]);

  const router = useRouter();

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

  const globalDebit = useMemo(() => getGlobalDebit(transactions), [transactions]);
  const totalPaidBack = useMemo(() => getTotalPaidBack(transactions), [transactions]);

  const pinnedFriends = useMemo(() =>
  {
    return friends.filter((friend) => friend.pinned);
  }, [friends]);

  const pinnedCount = pinnedFriends.length;

  const pinnedBudgets = useMemo(() =>
  {
    return budgets.filter((budget) => budget.pinned);
  }, [budgets]);

  const pinnedBudgetCount = pinnedBudgets.length;

  const getFriendBalance = useMemo(
    () => (friendId: string) => getBalance(friendId, transactions),
    [transactions],
  );

  const getBudgetTotalSpent = useMemo(
    () => (budgetId: string) => getTotalSpent(budgetId),
    [getTotalSpent],
  );

  const getBudgetRemaining = useMemo(
    () => (budgetId: string) => getRemainingBudget(budgetId),
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
    friends,
    queueSize,
    isOnline,
    globalDebit,
    totalPaidBack,
    pinnedFriends,
    pinnedCount,
    pinnedBudgets,
    pinnedBudgetCount,
    getFriendBalance,
    getBudgetTotalSpent,
    getBudgetRemaining,
    handleUnpin,
    handleUnpinBudget,
    router,
  };
};
