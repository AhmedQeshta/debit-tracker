import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const useSettle = () => {
  const [settlingFriendId, setSettlingFriendId] = useState<string | null>(null);
  const { settleTransactionsByFriendId } = useTransactionsStore();

  const { showConfirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();
  const { mutateSettleFriend } = useSyncMutation();
  const { syncEnabled, clearQueueForFriend } = useSyncStore();
  const { syncNow } = useCloudSync();

  const friends = useFriendsStore(useShallow((state) => state.friends.filter((f) => !f.deletedAt)));
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => !t.deletedAt)),
  );

  const handleSettleUp = (friendId: string, friendName?: string): void => {
    if (!friendId || settlingFriendId === friendId) return;

    const friend = friends.find((item) => item.id === friendId);
    if (!friend && !friendName) return;
    const displayName = friendName || friend?.name || 'this friend';

    showConfirm(
      `Settle up with ${displayName}?`,
      `This will clear all transactions with ${displayName} and reset the balance to ₪0.00. You can't undo this.`,
      async () => {
        if (settlingFriendId === friendId) return;

        setSettlingFriendId(friendId);
        try {
          const activeFriendTransactions = useTransactionsStore
            .getState()
            .transactions.filter(
              (transaction) => transaction.friendId === friendId && !transaction.deletedAt,
            );

          if (activeFriendTransactions.length === 0) {
            toastSuccess('Settled. Balance is now ₪0.00');
            return;
          }

          const transactionIds = activeFriendTransactions.map((transaction) => transaction.id);
          clearQueueForFriend(friendId, transactionIds);

          settleTransactionsByFriendId(friendId);

          if (syncEnabled) {
            await mutateSettleFriend(friendId);
            await syncNow();
          }

          toastSuccess('Settled. Balance is now ₪0.00');
        } catch (error) {
          console.error('[Settle] Failed to settle up:', error);
          toastError("Couldn't settle right now. Try again.");
        } finally {
          setSettlingFriendId(null);
        }
      },
      { confirmText: 'Settle up', cancelText: 'Cancel' },
    );
  };

  const isSettling = (friendId: string) => settlingFriendId === friendId;
  const canSettle = (friendId: string) =>
    transactions.some((transaction) => transaction.friendId === friendId);

  return {
    handleSettleUp,
    isSettling,
    canSettle,
    settlingFriendId,
  };
};
