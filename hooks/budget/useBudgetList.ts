import { useDrawerContext } from '@/hooks/drawer/useDrawerContext';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { sortBudgets } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';

export const useBudgetList = () => {
  const { openDrawer } = useDrawerContext();
  const router = useRouter();
  const budgets = useBudgetStore(useShallow((state) => state.budgets.filter((b) => !b.deletedAt)));
  const { pinBudget, unpinBudget, deleteBudget, getTotalSpent, getRemainingBudget } =
    useBudgetStore();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow } = useCloudSync();

  const sortedBudgets = sortBudgets(budgets);

  const handlePinToggle = (budgetId: string): void => {
    const budget = budgets.find((b) => b.id === budgetId);
    if (budget) {
      if (budget.pinned) {
        unpinBudget(budgetId);
      } else {
        pinBudget(budgetId);
      }
    }
  };

  const handleDelete = (budgetId: string, title: string): void => {
    showConfirm(
      'Delete Budget',
      `Are you sure you want to delete "${title}"?`,
      async () => {
        deleteBudget(budgetId);
        toastSuccess('Budget deleted successfully');

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

  return {
    budgets,
    sortedBudgets,
    handlePinToggle,
    handleDelete,
    router,
    openDrawer,
    pinBudget,
    unpinBudget,
    deleteBudget,
    getTotalSpent,
    getRemainingBudget,
  };
};
