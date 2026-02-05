import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useBudgetStore } from '@/store/budgetStore';
import { getGlobalDebit, getTotalPaidBack } from '@/lib/utils';

/**
 * Single source of truth for pending sync count
 * Counts all dirty items across all stores
 */
export const selectPendingCount = (): number => {
  const friends = useFriendsStore.getState().friends;
  const transactions = useTransactionsStore.getState().transactions;
  const budgets = useBudgetStore.getState().budgets;

  const dirtyFriends = friends.filter((f) => !f.synced || f.deletedAt !== undefined);
  const dirtyTransactions = transactions.filter((t) => !t.synced || t.deletedAt !== undefined);
  const dirtyBudgets = budgets.filter((b) => b.synced !== true || b.deletedAt !== undefined);

  // Count dirty budget items
  const dirtyBudgetItems = budgets.reduce((count, budget) => {
    const dirtyItems = budget.items.filter((item) => !item.synced || item.deletedAt !== undefined);
    return count + dirtyItems.length;
  }, 0);

  return dirtyFriends.length + dirtyTransactions.length + dirtyBudgets.length + dirtyBudgetItems;
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

