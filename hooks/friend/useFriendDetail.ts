import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useShallow } from 'zustand/react/shallow';
import { getBalance, safeId } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { useOperations } from '@/hooks/useOperations';
import { confirmDelete } from '@/lib/alert';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';

export const useFriendDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const friendId = safeId(id);
  const friend = useFriendsStore((state) => state.friends.find((f) => f.id === friendId));
  const { deleteFriend } = useFriendsStore();
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => t.friendId === friendId)),
  );
  const { deleteTransaction } = useTransactionsStore();

  const { navigateToFriendEdit, navigateBack } = useNavigation();
  const { mutate } = useSyncMutation();
  const { handleFriendPinToggle: togglePin } = useOperations();

  const balance = useMemo(() => getBalance(friendId, transactions), [friendId, transactions]);

  const handleEditFriend = (): void => {
    if (!friendId) return;
    navigateToFriendEdit(friendId);
  };

  const handleDeleteFriend = (): void => {
    if (!friend || !friendId) return;

    confirmDelete(
      'Delete Friend',
      'Are you sure you want to delete this friend and all records?',
      async () => {
        // Delete all transactions for this friend
        // TODO: Batch delete or iterate. Iterate for now.
        for (const t of transactions) {
          deleteTransaction(t.id);
          await mutate('transaction', 'delete', { id: t.id });
        }

        // Delete the friend
        deleteFriend(friendId);
        await mutate('friend', 'delete', { id: friendId });

        navigateBack();
      },
    );
  };

  const handleDeleteTransaction = (transactionId: string): void => {
    confirmDelete(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      async () => {
        deleteTransaction(transactionId);
        await mutate('transaction', 'delete', { id: transactionId });
      },
    );
  };

  const handleEditTransaction = (transactionId: string): void => {
    router.push(`/(drawer)/transaction/${transactionId}/edit`);
  };

  const handlePinToggle = (): void => {
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
