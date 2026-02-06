import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { useToast } from '@/contexts/ToastContext';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useNavigation } from '@/hooks/useNavigation';
import { filterFriends, getBalance } from '@/lib/utils';
import { syncService } from '@/services/syncService';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useAuth } from '@clerk/clerk-expo';
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const useFriendsList = () => {
  const { pinFriend, unpinFriend, deleteFriend } = useFriendsStore();
  const { deleteTransaction } = useTransactionsStore();
  const { navigateToFriendEdit } = useNavigation();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow, isOnline } = useCloudSync();
  const { getToken } = useAuth();
  const [search, setSearch] = useState('');
  const [isGrid, setIsGrid] = useState(false);
  const friends = useFriendsStore(useShallow((state) => state.friends.filter((f) => !f.deletedAt)));
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => !t.deletedAt)),
  );

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
    showConfirm(
      'Delete Friend',
      `Are you sure you want to delete "${friendName}"? This will also delete all associated transactions.`,
      async () => {
        const { cloudUserId, syncEnabled } = useSyncStore.getState();

        // 1. Check if we can do online delete
        if (syncEnabled && isOnline && cloudUserId) {
          toastSuccess('Deleting from cloud...'); // Use generic toast for feedback
          try {
            const result = await syncService.deleteFriendWithTransactions(
              friendId,
              cloudUserId,
              getToken,
            );

            if (result.success) {
              // Online delete success -> remove locally permanently
              // We need to remove transactions first
              const allFriendTransactions = useTransactionsStore
                .getState()
                .transactions.filter((t) => t.friendId === friendId);

              allFriendTransactions.forEach((t) => {
                useTransactionsStore.getState().removeDeletedTransaction(t.id);
              });

              // Remove friend permanently
              useFriendsStore.getState().removeDeletedFriend(friendId);

              toastSuccess('Friend deleted permanently');
              return;
            } else {
              console.error('Online delete failed, falling back to offline delete', result.error);
              // Fallthrough to offline logic
            }
          } catch (e) {
            console.error('Online delete exception, falling back to offline delete', e);
            // Fallthrough to offline logic
          }
        }

        // 2. Offline / Fallback logic (Mark for deletion)

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

        if (syncEnabled && isOnline) {
          toastSuccess('Cloud deletion failed. Deleted locally and queued for sync.');
        } else {
          toastSuccess('Friend deleted locally (will sync when online)');
        }

        // Trigger sync to push deletions to Supabase (if online)
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: 'Delete' },
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
