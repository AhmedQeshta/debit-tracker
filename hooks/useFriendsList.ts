import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useFriendsStore } from '@/store/friendsStore';
import { filterFriends, getBalance } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { confirmDelete } from '@/lib/alert';
import { useFriendSync } from '@/hooks/friend/useFriendSync';

export const useFriendsList = () => {
  const { pinFriend, unpinFriend, deleteFriend } = useFriendsStore();
  const { deleteTransaction } = useTransactionsStore();
  const { navigateToFriendEdit } = useNavigation();
  const { addToSyncQueue } = useFriendSync();
  const [search, setSearch] = useState('');
  const [isGrid, setIsGrid] = useState(false);
  const friends = useFriendsStore(useShallow((state) => state.friends));
  const transactions = useTransactionsStore(useShallow((state) => state.transactions));

  const getFriendBalance = useMemo(
    () => (friendId: string) => getBalance(friendId, transactions),
    [transactions],
  );

  const filteredFriends = useMemo(() => {
    const filtered = filterFriends(friends, search);
    return [...filtered].sort((a, b) =>
      a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : b.createdAt - a.createdAt,
    );
  }, [friends, search]);

  const handlePinToggle = (friendId: string): void => {
    const friend = filteredFriends.find((f) => f.id === friendId);
    if (friend) {
      if (friend.pinned) unpinFriend(friendId);
      else pinFriend(friendId);
    }
  };

  const handleFriendEdit = (friendId: string): void => navigateToFriendEdit(friendId);

  const handleFriendDelete = (friendId: string, friendName: string): void => {
    const friendTransactions = useTransactionsStore
      .getState()
      .transactions.filter((t) => t.friendId === friendId);

    confirmDelete(
      'Delete Friend',
      `Are you sure you want to delete "${friendName}" and all records?`,
      () => {
        // Delete all transactions for this friend
        friendTransactions.forEach((t) => {
          deleteTransaction(t.id);
          addToSyncQueue('transaction', 'delete', { id: t.id });
        });

        // Delete the friend
        deleteFriend(friendId);
        addToSyncQueue('friend', 'delete', { id: friendId });
      },
    );
  };

  return {
    filteredFriends,
    isGrid,
    setSearch,
    setIsGrid,
    getFriendBalance,
    search,
    handlePinToggle,
    handleFriendEdit,
    handleFriendDelete,
  };
};
