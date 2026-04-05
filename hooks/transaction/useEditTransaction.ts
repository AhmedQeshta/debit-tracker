import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { useToast } from '@/hooks/useToast';
import { safeId } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { IEditTransactionFormData } from '@/types/transaction';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export const useEditTransaction = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = safeId(id);
  const router = useRouter();
  const { transactions, updateTransaction } = useTransactionsStore();
  const { budgets, getRemainingBudget, upsertItemFromTransaction, removeItemByTransactionId } =
    useBudgetStore();
  const { mutate } = useSyncMutation();
  const { toastSuccess } = useToast();
  const [loading, setLoading] = useState(false);

  const transaction = transactions.find((t) => t.id === transactionId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IEditTransactionFormData>({
    defaultValues: {
      amount: '',
      description: '',
      isNegative: true,
      budgetId: '',
    },
  });

  useEffect(() => {
    if (transaction) {
      reset({
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.title,
        isNegative: transaction.amount < 0,
        budgetId: transaction.budgetId || '',
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (data: IEditTransactionFormData) => {
    if (!transaction) return;

    setLoading(true);
    try {
      const amountNum = parseFloat(data.amount);
      const finalAmount = data.isNegative ? -Math.abs(amountNum) : Math.abs(amountNum);

      const updatedTransaction = {
        ...transaction,
        budgetId: data.budgetId || undefined,
        amount: finalAmount,
        sign: data.isNegative ? 1 : -1,
        title: data.description,
        synced: false,
        updatedAt: Date.now(),
      };

      updateTransaction(updatedTransaction);
      await mutate('transaction', 'update', updatedTransaction);

      const previousBudgetId = transaction.budgetId;
      const nextBudgetId = updatedTransaction.budgetId;

      if (previousBudgetId && !nextBudgetId) {
        const removedItem = removeItemByTransactionId(transaction.id);
        if (removedItem) {
          await mutate('budget_item', 'delete', removedItem);
          await mutate('budget', 'update', { id: previousBudgetId, source: 'transaction' });
        }
      } else if (nextBudgetId) {
        const linkedItem = upsertItemFromTransaction(updatedTransaction, nextBudgetId);
        if (linkedItem) {
          await mutate('budget_item', 'update', linkedItem);
          await mutate('budget', 'update', { id: nextBudgetId, source: 'transaction' });
          if (previousBudgetId && previousBudgetId !== nextBudgetId) {
            await mutate('budget', 'update', { id: previousBudgetId, source: 'transaction_move' });
          }
        }
      }

      toastSuccess('Transaction updated successfully');

      router.push(`/(drawer)/friend/${transaction.friendId}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    errors,
    handleSubmit: handleSubmit(onSubmit),
    transaction,
    loading,
    budgets: budgets.filter((budget) => !budget.archivedAt && !budget.deletedAt),
    getRemainingBudget,
    router,
  };
};
