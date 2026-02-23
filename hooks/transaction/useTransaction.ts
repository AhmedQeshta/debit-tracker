import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';

export const useTransaction = () => {
  const router = useRouter();
  const { openDrawer } = useDrawerContext();
  const { deleteTransaction } = useTransactionsStore();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow } = useCloudSync();
  const friends = useFriendsStore(useShallow((state) => state.friends.filter((f) => !f.deletedAt)));
  const transactions = useTransactionsStore(
    useShallow((state) => state.transactions.filter((t) => !t.deletedAt)),
  );

  const handleEdit = (id: string) => {
    router.push(`/(drawer)/transaction/${id}/edit`);
  };

  const handleDelete = (id: string, title: string) => {
    showConfirm(
      'Delete Transaction',
      `Are you sure you want to delete "${title}"?`,
      async () => {
        // Delete transaction (store handles sync tracking automatically)
        deleteTransaction(id);
        toastSuccess('Transaction deleted successfully');

        // Trigger sync to push deletion to Supabase
        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after delete:', error);
        }
      },
      { confirmText: 'Delete' },
    );
  };

  const handleNavigateToNewTransaction = () => {
    if (friends.length > 0) {
      router.push('/(drawer)/transaction/new');
      return;
    }

    showConfirm(
      'Add a friend first',
      'You need at least one friend before adding a transaction.',
      () => {
        router.push('/(drawer)/friend/new');
      },
      { confirmText: 'Add Friend', cancelText: 'Later' },
    );
  };

  return {
    openDrawer,
    deleteTransaction,
    showConfirm,
    toastSuccess,
    syncNow,
    friends,
    transactions,
    handleEdit,
    handleDelete,
    handleNavigateToNewTransaction,
  };
};
