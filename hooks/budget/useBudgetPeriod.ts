import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useBudgetStore } from '@/store/budgetStore';

export const useBudgetPeriod = () => {
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { removeItem } = useBudgetStore();
  const { syncNow } = useCloudSync();

  const handleBudgetResetPeriod = (budgetId: string, title: string) => {
    showConfirm(
      'Reset Budget Period',
      `Clear all transactions from "${title}" and start a new period?`,
      async () => {
        const budget = useBudgetStore
          .getState()
          .budgets.find((b) => b.id === budgetId && !b.deletedAt);
        if (!budget) return;

        const activeItems = budget.items.filter((item) => !item.deletedAt);
        activeItems.forEach((entry) => {
          removeItem(budgetId, entry.id);
        });

        toastSuccess('Budget period has been reset');

        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after period reset:', error);
        }
      },
      { confirmText: 'Reset' },
    );
  };

  return {
    handleBudgetResetPeriod,
  };
};
