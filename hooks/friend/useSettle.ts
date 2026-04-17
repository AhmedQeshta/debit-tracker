import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

export const useSettle = () => {
  const { t } = useTranslation();
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
    const displayName = friendName || friend?.name || t('friendHooks.settle.defaultFriendName');

    showConfirm(
      t('friendHooks.settle.confirmTitle', { name: displayName }),
      t('friendHooks.settle.confirmMessage', { name: displayName }),
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
            toastSuccess(t('friendHooks.settle.success'));
            return;
          }

          const transactionIds = activeFriendTransactions.map((transaction) => transaction.id);
          clearQueueForFriend(friendId, transactionIds);

          settleTransactionsByFriendId(friendId);

          if (syncEnabled) {
            await mutateSettleFriend(friendId);
            await syncNow();
          }

          toastSuccess(t('friendHooks.settle.success'));
        } catch (error) {
          console.error('[Settle] Failed to settle up:', error);
          toastError(t('friendHooks.settle.error'));
        } finally {
          setSettlingFriendId(null);
        }
      },
      {
        confirmText: t('friendHooks.settle.confirmAction'),
        cancelText: t('common.actions.cancel'),
      },
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
