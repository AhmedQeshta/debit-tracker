import { useCopyAmount } from '@/hooks/useCopyAmount';
import { useBudgetStore } from '@/store/budgetStore';

interface Budget {
  id: string;
  currency: string;
}

export const useBudgetAmount = (displayedBudgets: Budget[]) => {
  const { handleCopyAmount } = useCopyAmount();
  const { getRemainingBudget } = useBudgetStore();
  const handleBudgetAmountCopy = async (BudgetId: string) => {
    const remaining = getRemainingBudget(BudgetId);
    const budget = displayedBudgets.find((b: Budget) => b.id === BudgetId);
    const currency = budget ? budget.currency : '$';
    await handleCopyAmount(Math.abs(remaining), currency, {
      successMessage: `Copied ${currency}${Math.abs(remaining).toFixed(2)} to clipboard`,
      errorMessage: 'Failed to copy amount',
    });
  };

  return {
    handleBudgetAmountCopy,
  };
};
