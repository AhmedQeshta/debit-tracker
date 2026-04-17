import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useBudgetStore } from '@/store/budgetStore';
import { useTranslation } from 'react-i18next';

export const useBudgetPeriod = () => {
  const { t } = useTranslation();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { removeItem } = useBudgetStore();
  const { syncNow } = useCloudSync();

  const handleBudgetResetPeriod = (budgetId: string, title: string) => {
    showConfirm(
      t('budgetHooks.resetPeriod.confirmTitle'),
      t('budgetHooks.resetPeriod.confirmMessage', { title }),
      async () => {
        const budget = useBudgetStore
          .getState()
          .budgets.find((b) => b.id === budgetId && !b.deletedAt);
        if (!budget) return;

        const activeItems = budget.items.filter((item) => !item.deletedAt);
        activeItems.forEach((entry) => {
          removeItem(budgetId, entry.id);
        });

        toastSuccess(t('budgetHooks.resetPeriod.success'));

        try {
          await syncNow();
        } catch (error) {
          console.error('[Sync] Failed to sync after period reset:', error);
        }
      },
      { confirmText: t('budgetHooks.resetPeriod.confirmAction') },
    );
  };

  return {
    handleBudgetResetPeriod,
  };
};
