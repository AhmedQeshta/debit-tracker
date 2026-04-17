import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useSummaryCurrency } from '@/hooks/useSummaryCurrency';
import { useToast } from '@/hooks/useToast';
import {
  formatAbsoluteCurrency,
  getDayLabel,
  getFriendName,
  getMonthLabel,
  getStatus,
} from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { ITransactionRow, ITransactionSection } from '@/types/transaction';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

export const useTransaction = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const router = useRouter();
  const { summaryCurrency, summaryCurrencyLabel, handleSummaryCurrencyToggle } =
    useSummaryCurrency();
  const { openDrawer } = useDrawerContext();
  const { deleteTransaction } = useTransactionsStore();
  const { removeItemByTransactionId } = useBudgetStore();
  const budgets = useBudgetStore(useShallow((state) => state.budgets.filter((b) => !b.deletedAt)));
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow, isOnline, isSyncing } = useCloudSync();
  const { mutate } = useSyncMutation();
  const lastSyncError = useSyncStore((state) => state.lastError);
  const friends = useFriendsStore(useShallow((state) => state.friends.filter((f) => !f.deletedAt)));
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => !t.deletedAt)),
  );

  const monthLabel = useMemo(() => getMonthLabel(Date.now()), []);

  const rows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase(); // null

    const baseRows = transactions.map<ITransactionRow>((transaction) => {
      const friendName = getFriendName(friends, transaction.friendId);
      const friendCurrency =
        friends.find((friend) => friend.id === transaction.friendId)?.currency || '$';
      const hasSyncError = !!lastSyncError && !transaction.synced && isOnline;
      const syncStatus = getStatus(transaction.synced, hasSyncError);
      const amountTone: ITransactionRow['amountTone'] =
        transaction.amount > 0 ? 'positive' : 'negative';
      const amountDirectionLabel: ITransactionRow['amountDirectionLabel'] =
        transaction.amount > 0 ? 'Received' : 'Paid';
      const title = transaction.title;
      const subtitle = transaction.note
        ? transaction.note
        : t('transactionHooks.row.withFriend', { name: friendName });
      const linkedBudget = budgets.find((budget) => budget.id === transaction.budgetId);
      const budgetRemainingText = linkedBudget
        ? formatAbsoluteCurrency(
            linkedBudget.remaining ?? linkedBudget.totalBudget - (linkedBudget.netSpent ?? 0),
            linkedBudget.currency,
          )
        : undefined;

      return {
        transaction,
        friendName,
        title,
        subtitle,
        budgetName: linkedBudget?.title,
        budgetRemainingText,
        amountText: formatAbsoluteCurrency(transaction.amount, friendCurrency),
        amountDirectionLabel,
        amountTone,
        dateText: new Date(transaction.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        timeText: new Date(transaction.date).toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        }),
        syncStatus,
      };
    });

    const searchedRows = query
      ? baseRows.filter((row) => {
          const haystack = `${row.title} ${row.subtitle} ${row.friendName}`.toLowerCase();
          return haystack.includes(query);
        })
      : baseRows;

    return searchedRows.sort((a, b) => {
      return b.transaction.date - a.transaction.date;
    });
  }, [transactions, friends, budgets, lastSyncError, isOnline, searchQuery, t]);

  const groupedSections = useMemo<ITransactionSection[]>(() => {
    const buckets = rows.reduce<Record<string, typeof rows>>((accumulator, row) => {
      const label = getDayLabel(row.transaction.date);
      if (!accumulator[label]) {
        accumulator[label] = [];
      }
      accumulator[label].push(row);
      return accumulator;
    }, {});

    return Object.entries(buckets)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => {
        const firstA = a.data[0]?.transaction.date || 0;
        const firstB = b.data[0]?.transaction.date || 0;
        return firstB - firstA;
      });
  }, [rows]);

  const summary = useMemo(() => {
    const now = new Date();
    const monthTransactions = rows.filter((row) => {
      const date = new Date(row.transaction.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const currencyFilteredTransactions = monthTransactions.filter((row) => {
      const friendCurrency = friends.find(
        (friend) => friend.id === row.transaction.friendId,
      )?.currency;
      return (friendCurrency || '$') === summaryCurrency;
    });

    const totalThisMonth = currencyFilteredTransactions.reduce(
      (sum, row) => sum + Math.abs(row.transaction.amount),
      0,
    );
    const youPaid = currencyFilteredTransactions
      .filter((row) => row.transaction.amount < 0)
      .reduce((sum, row) => sum + Math.abs(row.transaction.amount), 0);
    const youReceived = currencyFilteredTransactions
      .filter((row) => row.transaction.amount > 0)
      .reduce((sum, row) => sum + row.transaction.amount, 0);

    return {
      totalThisMonth,
      youPaid,
      youReceived,
    };
  }, [rows, friends, summaryCurrency]);

  const isLoading = isSyncing && transactions.length === 0;

  const handleEdit = (id: string) => {
    router.push(`/(drawer)/transaction/${id}/edit`);
  };

  const handleDelete = (id: string, title: string) => {
    showConfirm(
      t('friendHooks.detail.deleteTransaction.confirmTitle'),
      t('friendHooks.detail.deleteTransaction.confirmMessage', { title }),
      async () => {
        const transaction = transactions.find((item) => item.id === id);
        const removedItem = removeItemByTransactionId(id);

        // Delete transaction (store handles sync tracking automatically)
        deleteTransaction(id);
        toastSuccess(t('friendHooks.detail.deleteTransaction.success'));

        if (transaction) {
          await mutate('transaction', 'delete', transaction);
        }
        if (removedItem) {
          await mutate('budget_item', 'delete', removedItem);
          await mutate('budget', 'update', { id: removedItem.budgetId, source: 'transaction' });
        }

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

  const handleRowPress = (id: string) => {
    router.push(`/(drawer)/transaction/${id}/edit`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncNow();
    } finally {
      setRefreshing(false);
    }
  };

  const handleNavigateToNewTransaction = () => {
    if (friends.length > 0) {
      router.push('/(drawer)/transaction/new');
      return;
    }

    showConfirm(
      t('transactions.empty.addFriendFirst'),
      t('transactionHooks.empty.addFriendRequiredMessage'),
      () => {
        router.push('/(drawer)/friend/new');
      },
      {
        confirmText: t('transactions.actions.addFriend'),
        cancelText: t('transactionHooks.actions.later'),
      },
    );
  };

  const hasData = groupedSections.length > 0;

  return {
    openDrawer,
    deleteTransaction,
    showConfirm,
    toastSuccess,
    syncNow,
    friends,
    transactions,
    rows,
    groupedSections,
    summary,
    monthLabel,
    searchQuery,
    setSearchQuery,
    refreshing,
    isLoading,
    handleEdit,
    handleDelete,
    handleRowPress,
    handleRefresh,
    handleNavigateToNewTransaction,
    showControls,
    setShowControls,
    summaryCurrency,
    summaryCurrencyLabel,
    handleSummaryCurrencyToggle,
    hasData,
  };
};
