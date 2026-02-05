import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useFriendsStore } from '@/store/friendsStore';
import { filterFriends, getBalance } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { useToast } from '@/contexts/ToastContext';
import { useCloudSync } from '@/hooks/sync/useCloudSync';

export const useFriendsList = () =>
{
  const { pinFriend, unpinFriend, deleteFriend } = useFriendsStore();
  const { deleteTransaction } = useTransactionsStore();
  const { navigateToFriendEdit } = useNavigation();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow } = useCloudSync();
  const [search, setSearch] = useState('');
  const [isGrid, setIsGrid] = useState(false);
  const friends = useFriendsStore(useShallow((state) => state.friends.filter((f) => !f.deletedAt)));
  const transactions = useTransactionsStore(useShallow((state) => state.transactions.filter((t) => !t.deletedAt)));

  const getFriendBalance = useMemo(
    () => (friendId: string) => getBalance(friendId, transactions),
    [transactions],
  );

  const filteredFriends = useMemo(() =>
  {
    const filtered = filterFriends(friends, search);
    return [...filtered].sort((a, b) =>
      a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : b.createdAt - a.createdAt,
    );
  }, [friends, search]);

  const handlePinToggle = (friendId: string): void =>
  {
    const friend = filteredFriends.find((f) => f.id === friendId);
    if (friend)
    {
      if (friend.pinned) unpinFriend(friendId);
      else pinFriend(friendId);
    }
  };

  const handleFriendEdit = (friendId: string): void => navigateToFriendEdit(friendId);

  const handleFriendDelete = (friendId: string, friendName: string): void =>
  {
    showConfirm(
      'Delete Friend',
      `Are you sure you want to delete "${friendName}"? This will also delete all associated transactions.`,
      async () => {
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
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: 'Delete' }
    );
  };

  return {
    friends,
    filteredFriends,
    search,
    setSearch,
    isGrid,
    setIsGrid,
    handlePinToggle,
    handleFriendEdit,
    handleFriendDelete,
    getFriendBalance,
  };
};
