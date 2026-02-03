import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useFriendsStore } from '@/store/friendsStore';
import { filterFriends, getBalance } from '@/lib/utils';
import { useNavigation } from '@/hooks/useNavigation';
import { confirmDelete } from '@/lib/alert';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';

export const useFriendsList = () =>
{
  const { pinFriend, unpinFriend, deleteFriend } = useFriendsStore();
  const { deleteTransaction } = useTransactionsStore();
  const { navigateToFriendEdit } = useNavigation();
  const { mutate } = useSyncMutation();
  const [search, setSearch] = useState('');
  const [isGrid, setIsGrid] = useState(false);
  const friends = useFriendsStore(useShallow((state) => state.friends));
  const transactions = useTransactionsStore(useShallow((state) => state.transactions));

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
    // confirmDelete('Delete Friend', `Are you sure you want to delete ${friendName}?`, async () => {
    //     // Find friend's transactions
    //     const friendTransactions = transactions.filter(t => t.friendId === friendId);

    //     for (const t of friendTransactions) {
    //       deleteTransaction(t.id);
    //         await mutate('transaction', 'delete', { id: t.id });
    //     }

    //     deleteFriend(friendId);
    //   await mutate('friend', 'delete', { id: friendId });
    // });

    const friendTransactions = transactions.filter(t => t.friendId === friendId);

    for (const t of friendTransactions)
    {
      deleteTransaction(t.id);
      await mutate('transaction', 'delete', { id: t.id });
    }

    deleteFriend(friendId);
    await mutate('friend', 'delete', { id: friendId });
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
