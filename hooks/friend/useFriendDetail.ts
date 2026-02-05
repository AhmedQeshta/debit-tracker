import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { useToast } from '@/contexts/ToastContext';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useNavigation } from '@/hooks/useNavigation';
import { useOperations } from '@/hooks/useOperations';
import { getBalance, safeId } from '@/lib/utils';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const useFriendDetail = () =>
{
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const friendId = safeId(id);
  const friend = useFriendsStore((state) => state.friends.find((f) => f.id === friendId && !f.deletedAt));
  const { deleteFriend } = useFriendsStore();
  // Get all transactions for display (excluding deleted)
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => t.friendId === friendId && !t.deletedAt)),
  );
  const { deleteTransaction } = useTransactionsStore();

  const { navigateToFriendEdit, navigateBack } = useNavigation();
  const { handleFriendPinToggle: togglePin } = useOperations();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow } = useCloudSync();

  const balance = useMemo(() => getBalance(friendId, transactions), [friendId, transactions]);

  const handleEditFriend = (): void =>
  {
    if (!friendId) return;
    navigateToFriendEdit(friendId);
  };

  const handleDeleteFriend = (): void =>
  {
    if (!friend || !friendId) return;

    showConfirm(
      'Delete Friend',
      `Are you sure you want to delete "${friend.name}"? This will also delete all associated transactions.`,
      async () =>
      {
        // Delete all transactions for this friend first (get all, including already deleted ones)
        const allFriendTransactions = useTransactionsStore
          .getState()
          .transactions.filter((t) => t.friendId === friendId);

        for (const t of allFriendTransactions)
        {
          // Only delete if not already marked for deletion
          if (!t.deletedAt)
          {
            deleteTransaction(t.id);
          }
        }

        // Delete the friend (stores handle sync tracking automatically)
        deleteFriend(friendId);
        toastSuccess('Friend deleted successfully');

        // Trigger sync to push deletions to Supabase
        try
        {
          await syncNow();
        } catch (error)
        {
          console.error('[Sync] Failed to sync after delete:', error);
        }

        router.push('/(drawer)/(tabs)/friends');
      },
      { confirmText: 'Delete' }
    );
  };

  const handleDeleteTransaction = (transactionId: string): void =>
  {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;

    showConfirm(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.title}"?`,
      async () =>
      {
        // Delete transaction (store handles sync tracking automatically)
        deleteTransaction(transactionId);
        toastSuccess('Transaction deleted successfully');

        // Trigger sync to push deletion to Supabase
        try
        {
          await syncNow();
        } catch (error)
        {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: 'Delete' }
    );
  };

  const handleEditTransaction = (transactionId: string): void =>
  {
    router.push(`/(drawer)/transaction/${transactionId}/edit`);
  };

  const handlePinToggle = (): void =>
  {
    if (!friend) return;
    togglePin(friend);
  };

  return {
    friend,
    transactions,
    balance,
    handleEditFriend,
    handleDeleteFriend,
    handleEditTransaction,
    handleDeleteTransaction,
    handlePinToggle,
    router,
    id: friendId,
  };
};
