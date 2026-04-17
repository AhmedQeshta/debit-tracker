import { useCopyAmount } from '@/hooks/useCopyAmount';
import { useBudgetStore } from '@/store/budgetStore';
import { useTranslation } from 'react-i18next';

type BudgetWithCurrency = {
  id: string;
  currency?: string;
};

export const useBudgetAmount = (displayedBudgets: BudgetWithCurrency[] = []) => {
  const { t } = useTranslation();
  const { handleCopyAmount } = useCopyAmount();
  const { getRemainingBudget, getBudget } = useBudgetStore();
  const handleBudgetAmountCopy = async (BudgetId: string) => {
    const remaining = getRemainingBudget(BudgetId);
    const budgetFromList = displayedBudgets.find((item) => item.id === BudgetId);
    const budgetFromStore = getBudget(BudgetId);
    const currency = budgetFromList?.currency || budgetFromStore?.currency || '$';

    await handleCopyAmount(Math.abs(remaining), currency, {
      successMessage: t('budgetHooks.amount.copySuccess', {
        currency,
        amount: Math.abs(remaining).toFixed(2),
      }),
      errorMessage: t('friendDetail.toasts.amountCopyFailed'),
    });
  };

  return {
    handleBudgetAmountCopy,
  };
};
