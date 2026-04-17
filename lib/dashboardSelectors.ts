import { getGlobalDebit, getTotalPaidBack } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { UnsyncedCounts } from '@/types/common';

export const getUnsyncedCounts = (): UnsyncedCounts => {
  const friends = useFriendsStore.getState().friends;
  const transactions = useTransactionsStore.getState().transactions;
  const budgets = useBudgetStore.getState().budgets;
  const syncQueue = useSyncStore.getState().queue;

  const dirtyFriends = friends.filter((f) => !f.synced || f.deletedAt !== undefined);
  const dirtyTransactions = transactions.filter((t) => !t.synced || t.deletedAt !== undefined);
  const dirtyBudgets = budgets.filter((b) => b.synced !== true || b.deletedAt !== undefined);

  const dirtyBudgetItems = budgets.reduce((count, budget) => {
    const dirtyItems = budget.items.filter((item) => !item.synced || item.deletedAt !== undefined);
    return count + dirtyItems.length;
  }, 0);

  return {
    friends: dirtyFriends.length,
    transactions: dirtyTransactions.length,
    budgetItems: dirtyBudgetItems,
    budgets: dirtyBudgets.length,
    syncQueue: syncQueue.length,
  };
};

export const getTotalUnsyncedCount = (counts: UnsyncedCounts): number => {
  return (
    counts.friends + counts.transactions + counts.budgetItems + counts.budgets + counts.syncQueue
  );
};

/**
 * Single source of truth for pending sync count
 * Counts all dirty items across all stores
 */
export const selectPendingCount = (): number => {
  const counts = getUnsyncedCounts();
  return getTotalUnsyncedCount(counts);
};

/**
 * Dashboard stats selector - single source of truth for all dashboard calculations
 */
export const selectDashboardStats = () => {
  const friends = useFriendsStore.getState().friends.filter((f) => !f.deletedAt);
  const transactions = useTransactionsStore.getState().transactions.filter((t) => !t.deletedAt);
  const budgets = useBudgetStore.getState().budgets.filter((b) => !b.deletedAt);

  const totalDebit = getGlobalDebit(transactions);
  const totalPaidBack = getTotalPaidBack(transactions);
  const totalFriends = friends.length;
  const pinnedFriends = friends.filter((f) => f.pinned);
  const pinnedBudgets = budgets.filter((b) => b.pinned);
  const pendingCount = selectPendingCount();

  return {
    totalDebit,
    totalPaidBack,
    totalFriends,
    pinnedFriends,
    pinnedBudgets,
    pendingCount,
    friends,
    transactions,
    budgets,
  };
};
