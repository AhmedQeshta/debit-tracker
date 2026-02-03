import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useFriendsStore } from '@/store/friendsStore';
import { filterFriends, getBalance } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { confirmDelete } from '@/lib/alert';

export const useFriendsList = () =>
{
  const { pinFriend, unpinFriend, deleteFriend } = useFriendsStore();
  const { deleteTransaction } = useTransactionsStore();
  const { navigateToFriendEdit } = useNavigation();
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

  const handleFriendDelete = async (friendId: string, friendName: string): Promise<void> =>
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
