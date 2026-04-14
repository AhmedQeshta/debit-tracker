import { useSettle } from '@/hooks/friend/useSettle';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useNavigation } from '@/hooks/useNavigation';
import { useSummaryCurrency } from '@/hooks/useSummaryCurrency';
import { useToast } from '@/hooks/useToast';
import { filterFriends, formatDateLabel, getBalance } from '@/lib/utils';
import { syncService } from '@/services/syncService';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import {
  FriendBalanceStatus,
  FriendsFilterBy,
  FriendsListItem,
  FriendsSortBy,
  IFriendListRow,
} from '@/types/friend';
import { useAuth } from '@clerk/clerk-expo';
import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

const normalizeCurrency = (currency: unknown): string => {
  if (typeof currency !== 'string') return '$';
  const trimmed = currency.trim();
  return trimmed.length > 0 ? trimmed : '$';
};

export const useFriendsList = () => {
  const [search, setSearch] = useState('');
  const [isGrid, setIsGrid] = useState(false);
  const [sortBy, setSortBy] = useState<FriendsSortBy>('recent');
  const [filterBy, setFilterBy] = useState<FriendsFilterBy>('all');
  const [showControls, setShowControls] = useState(true);

  const { summaryCurrency, summaryCurrencyLabel, handleSummaryCurrencyToggle } =
    useSummaryCurrency();

  const { pinFriend, unpinFriend, deleteFriend } = useFriendsStore();
  const { deleteTransaction } = useTransactionsStore();
  const { navigateToFriendEdit } = useNavigation();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();
  const { syncNow, isOnline } = useCloudSync();
  const { handleSettleUp } = useSettle();
  const { getToken } = useAuth();
  const { syncEnabled, isSyncRunning, syncStatus, deviceSyncState } = useSyncStore(
    useShallow((state) => ({
      syncEnabled: state.syncEnabled,
      isSyncRunning: state.isSyncRunning,
      syncStatus: state.syncStatus,
      deviceSyncState: state.deviceSyncState,
    })),
  );

  const friends = useFriendsStore(useShallow((state) => state.friends.filter((f) => !f.deletedAt)));
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => !t.deletedAt)),
  );

  const isLoading =
    friends.length === 0 &&
    syncEnabled &&
    isOnline &&
    !deviceSyncState.hasHydratedFromCloud &&
    (isSyncRunning || syncStatus === 'pulling' || syncStatus === null || syncStatus === 'checking');

  const getFriendBalance = useMemo(
    () => (friendId: string) => getBalance(friendId, transactions),
    [transactions],
  );

  const friendRows = useMemo(() => {
    const filtered = filterFriends(friends, search);
    const rows = filtered
      .map<IFriendListRow>((friend) => {
        const balance = getBalance(friend.id, transactions);
        const status: FriendBalanceStatus =
          balance > 0 ? 'owes-you' : balance < 0 ? 'you-owe' : 'settled';
        const directionLabel: IFriendListRow['directionLabel'] =
          balance > 0 ? 'Owes you' : balance < 0 ? 'You owe' : 'Settled';

        return {
          friend,
          balance,
          amountText: `${normalizeCurrency(friend.currency)}${Math.abs(balance).toFixed(2)}`,
          directionLabel,
          status,
          subtitle:
            friend.bio || `Last activity ${formatDateLabel(friend.updatedAt || friend.createdAt)}`,
        };
      })
      .filter((row) => (filterBy === 'all' ? true : row.status === filterBy));

    return rows.sort((a, b) => {
      if (a.friend.pinned && !b.friend.pinned) return -1;
      if (!a.friend.pinned && b.friend.pinned) return 1;

      if (sortBy === 'name') {
        return a.friend.name.localeCompare(b.friend.name);
      }

      if (sortBy === 'balance') {
        return Math.abs(b.balance) - Math.abs(a.balance);
      }

      return b.friend.createdAt - a.friend.createdAt;
    });
  }, [friends, transactions, search, filterBy, sortBy]);

  const summary = useMemo(() => {
    const activeFriends = friends.filter(
      (friend) => normalizeCurrency(friend.currency) === summaryCurrency,
    );
    const balances = activeFriends.map((friend) => getBalance(friend.id, transactions));

    const youOweTotal = balances
      .filter((value) => value < 0)
      .reduce((total, value) => total + Math.abs(value), 0);

    const owedToYouTotal = balances
      .filter((value) => value > 0)
      .reduce((total, value) => total + value, 0);

    const settledCount = balances.filter((value) => value === 0).length;
    const netBalance = balances.reduce((total, value) => total + value, 0);

    return {
      totalFriends: activeFriends.length,
      youOweTotal,
      owedToYouTotal,
      settledCount,
      netBalance,
    };
  }, [friends, transactions, summaryCurrency]);

  const handlePinToggle = (friendId: string): void => {
    const friend = friendRows.find((f) => f.friend.id === friendId)?.friend;
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

  const listData = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: isGrid ? 6 : 8 }, (_, index) => ({
        type: 'skeleton' as const,
        id: `skeleton-${index}`,
      }));
    }

    return friendRows as FriendsListItem[];
  }, [isLoading, isGrid, friendRows]);

  const handleCopyAmount = async (friendId: string) => {
    const friend = friendRows.find((row) => row.friend.id === friendId);
    if (!friend) return;

    const amount = friend.amountText;

    try {
      await Clipboard.setStringAsync(amount);
      toastSuccess(`Copied ${amount} to clipboard`);
    } catch (error) {
      console.error('Failed to copy amount: ', error);
      toastError('Failed to copy amount');
    }
  };

  return {
    friends,
    friendRows,
    summary,
    search,
    setSearch,
    isGrid,
    setIsGrid,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    handlePinToggle,
    handleFriendEdit,
    handleFriendDelete,
    getFriendBalance,
    handleCopyAmount,
    handleSettle: (friendId: string) => handleSettleUp(friendId),
    summaryCurrencyLabel,
    handleSummaryCurrencyToggle,
    summaryCurrency,
    showControls,
    setShowControls,
    listData,
  };
};
