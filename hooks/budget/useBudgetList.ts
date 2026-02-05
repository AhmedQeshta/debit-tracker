import { useRouter } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useBudgetStore } from "@/store/budgetStore";
import { useDrawerContext } from "@/hooks/drawer/useDrawerContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import { useToast } from "@/contexts/ToastContext";
import { sortBudgets } from "@/lib/utils";
import { useCloudSync } from "@/hooks/sync/useCloudSync";

export const useBudgetList = () =>
{
  const { openDrawer } = useDrawerContext();
  const router = useRouter();
  const budgets = useBudgetStore(useShallow((state) => state.budgets.filter((b) => !b.deletedAt)));
  const { pinBudget, unpinBudget, deleteBudget, getTotalSpent, getRemainingBudget } =
    useBudgetStore();
  const { showConfirm } = useConfirmDialog();
  const { toastSuccess } = useToast();
  const { syncNow } = useCloudSync();

  const sortedBudgets = sortBudgets(budgets);

  const handlePinToggle = (budgetId: string): void =>
  {
    const budget = budgets.find((b) => b.id === budgetId);
    if (budget)
    {
      budget.pinned ? unpinBudget(budgetId) : pinBudget(budgetId);
    }
  };

  const handleDelete = (budgetId: string, title: string): void =>
  {
    showConfirm(
      "Delete Budget",
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
      { confirmText: 'Delete' }
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
