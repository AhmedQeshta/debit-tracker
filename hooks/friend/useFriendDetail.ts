import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useShallow } from 'zustand/react/shallow';
import { getBalance, safeId } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { useOperations } from '@/hooks/useOperations';
import { confirmDelete } from '@/lib/alert';

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

  const balance = useMemo(() => getBalance(friendId, transactions), [friendId, transactions]);

  const handleEditFriend = (): void =>
  {
    if (!friendId) return;
    navigateToFriendEdit(friendId);
  };

  const handleDeleteFriend = async (): Promise<void> =>
  {
    if (!friend || !friendId) return;

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

    navigateBack();
  };

  const handleDeleteTransaction = async (transactionId: string): Promise<void> =>
  {
    // Delete transaction (store handles sync tracking automatically)
    deleteTransaction(transactionId);
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
