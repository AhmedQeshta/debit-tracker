import { useRouter } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useBudgetStore } from "@/store/budgetStore";
import { useDrawerContext } from "@/hooks/drawer/useDrawerContext";
import { confirmDelete } from "@/lib/alert";
import { sortBudgets } from "@/lib/utils";

export const useBudgetList = () =>
{
  const { openDrawer } = useDrawerContext();
  const router = useRouter();
  const budgets = useBudgetStore(useShallow((state) => state.budgets.filter((b) => !b.deletedAt)));
  const { pinBudget, unpinBudget, deleteBudget, getTotalSpent, getRemainingBudget } =
    useBudgetStore();

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
    // confirmDelete(
    //   "Delete Budget",
    //   `Are you sure you want to delete "${title}"?`,
    //   () => deleteBudget(budgetId)
    // );
    deleteBudget(budgetId)
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
