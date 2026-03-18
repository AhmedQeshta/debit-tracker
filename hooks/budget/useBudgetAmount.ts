import { useCopyAmount } from '@/hooks/useCopyAmount';
import { useBudgetStore } from '@/store/budgetStore';

type BudgetWithCurrency = {
  id: string;
  currency?: string;
};

export const useBudgetAmount = (displayedBudgets: BudgetWithCurrency[] = []) => {
  const { handleCopyAmount } = useCopyAmount();
  const { getRemainingBudget, getBudget } = useBudgetStore();
  const handleBudgetAmountCopy = async (BudgetId: string) => {
    const remaining = getRemainingBudget(BudgetId);
    const budgetFromList = displayedBudgets.find((item) => item.id === BudgetId);
    const budgetFromStore = getBudget(BudgetId);
    const currency = budgetFromList?.currency || budgetFromStore?.currency || '$';

    await handleCopyAmount(Math.abs(remaining), currency, {
      successMessage: `Copied ${currency}${Math.abs(remaining).toFixed(2)} to clipboard`,
      errorMessage: 'Failed to copy amount',
    });
  };

  return {
    handleBudgetAmountCopy,
  };
};
