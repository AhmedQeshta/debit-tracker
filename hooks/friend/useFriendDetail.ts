import { useSettle } from '@/hooks/friend/useSettle';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useNavigation } from '@/hooks/useNavigation';
import { useOperations } from '@/hooks/useOperations';
import { useToast } from '@/hooks/useToast';
import { getBalance, getBalanceBreakdown, safeId } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

export const useFriendDetail = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const friendId = safeId(id);
  const friend = useFriendsStore((state) =>
    state.friends.find((f) => f.id === friendId && !f.deletedAt),
  );
  const { deleteFriend } = useFriendsStore();
  // Get all transactions for display (excluding deleted)
  const transactions = useTransactionsStore(
    useShallow((state) =>
      state.transactions.filter((t) => t.friendId === friendId && !t.deletedAt),
    ),
  );
  const { deleteTransaction } = useTransactionsStore();
  const { removeItemByTransactionId } = useBudgetStore();

  const { navigateToFriendEdit } = useNavigation();
  const { handleFriendPinToggle: togglePin } = useOperations();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow } = useCloudSync();
  const { mutate } = useSyncMutation();
  const {
    handleSettleUp: settleFriendById,
    isSettling: isSettlingFriend,
    canSettle: canSettleFriend,
  } = useSettle();

  const balance = useMemo(() => getBalance(friendId, transactions), [friendId, transactions]);
  const breakdown = useMemo(() => getBalanceBreakdown(transactions), [transactions]);
  const pendingCount = useTransactionsStore(
    useShallow(
      (state) =>
        state.transactions.filter(
          (transaction) => transaction.friendId === friendId && !transaction.synced,
        ).length,
    ),
  );
  const lastActivity = useMemo(
    () => transactions.reduce((latest, transaction) => Math.max(latest, transaction.date), 0),
    [transactions],
  );

  const handleEditFriend = (): void => {
    if (!friendId) return;
    navigateToFriendEdit(friendId);
  };

  const handleDeleteFriend = (): void => {
    if (!friend || !friendId) return;

    showConfirm(
      t('friendHooks.detail.deleteFriend.confirmTitle'),
      t('friendHooks.detail.deleteFriend.confirmMessage', { name: friend.name }),
      async () => {
        // Delete all transactions for this friend first (get all, including already deleted ones)
        const allFriendTransactions = useTransactionsStore
          .getState()
          .transactions.filter((t) => t.friendId === friendId);

        for (const t of allFriendTransactions) {
          // Only delete if not already marked for deletion
          if (!t.deletedAt) {
            deleteTransaction(t.id);
          }
        }

        // Delete the friend (stores handle sync tracking automatically)
        deleteFriend(friendId);
        toastSuccess(t('friendHooks.detail.deleteFriend.success'));

        // Trigger sync to push deletions to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }

        router.push('/(drawer)/(tabs)/friends');
      },
      { confirmText: t('common.actions.delete') },
    );
  };

  const handleDeleteTransaction = (transactionId: string): void => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;

    showConfirm(
      t('friendHooks.detail.deleteTransaction.confirmTitle'),
      t('friendHooks.detail.deleteTransaction.confirmMessage', { title: transaction.title }),
      async () => {
        const removedItem = removeItemByTransactionId(transactionId);

        // Delete transaction (store handles sync tracking automatically)
        deleteTransaction(transactionId);
        await mutate('transaction', 'delete', transaction);
        if (removedItem) {
          await mutate('budget_item', 'delete', removedItem);
          await mutate('budget', 'update', { id: removedItem.budgetId, source: 'transaction' });
        }

        // Trigger sync to push deletion to Supabase
        try {
          await syncNow();
          toastSuccess(t('friendHooks.detail.deleteTransaction.success'));
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: t('common.actions.delete') },
    );
  };

  const handleEditTransaction = (transactionId: string): void => {
    router.push(`/(drawer)/transaction/${transactionId}/edit`);
  };

  const handlePinToggle = async (): Promise<void> => {
    if (!friend) return;
    togglePin(friend);
    await mutate('friend_pin', 'update', {
      id: friend.id,
      friendId: friend.id,
      pinned: !friend.pinned,
      updatedAt: Date.now(),
    });
  };

  const handleSettleUp = (): void => {
    if (!friendId) return;
    settleFriendById(friendId, friend?.name);
  };

  const isSettling = isSettlingFriend(friendId);
  const canSettle = canSettleFriend(friendId);

  return {
    friend,
    transactions,
    balance,
    breakdown,
    pendingCount,
    lastActivity,
    handleEditFriend,
    handleDeleteFriend,
    handleEditTransaction,
    handleDeleteTransaction,
    handlePinToggle,
    handleSettleUp,
    isSettling,
    canSettle,
    router,
    id: friendId,
  };
};
