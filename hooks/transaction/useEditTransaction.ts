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
  const { toastError, toastSuccess } = useToast();
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
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }

      const finalAmount = data.isNegative ? -Math.abs(amountNum) : Math.abs(amountNum);
      const nextBudgetId = data.budgetId || undefined;

      if (nextBudgetId) {
        const budgetExists = budgets.some(
          (budget) => budget.id === nextBudgetId && !budget.deletedAt && !budget.archivedAt,
        );
        if (!budgetExists) {
          throw new Error('Budget not found');
        }
      }

      const updatedTransaction = {
        ...transaction,
        budgetId: nextBudgetId,
        amount: finalAmount,
        sign: data.isNegative ? -1 : 1,
        title: data.description,
        synced: false,
        updatedAt: Date.now(),
      };

      updateTransaction(updatedTransaction);
      await mutate('transaction', 'update', updatedTransaction);

      const previousBudgetId = transaction.budgetId;
      const activeBudgetId = updatedTransaction.budgetId;

      if (previousBudgetId && !activeBudgetId) {
        const removedItem = removeItemByTransactionId(transaction.id);
        if (removedItem) {
          await mutate('budget_item', 'delete', removedItem);
          await mutate('budget', 'update', { id: previousBudgetId, source: 'transaction' });
        }
      } else if (activeBudgetId) {
        const movedBetweenBudgets = previousBudgetId && previousBudgetId !== activeBudgetId;

        if (movedBetweenBudgets) {
          const removedItem = removeItemByTransactionId(transaction.id);
          if (removedItem) {
            await mutate('budget_item', 'delete', removedItem);
            await mutate('budget', 'update', { id: previousBudgetId, source: 'transaction_move' });
          }
        }

        const linkedItem = upsertItemFromTransaction(updatedTransaction, activeBudgetId);
        if (!linkedItem) {
          throw new Error('Failed to update budget');
        }

        await mutate('budget_item', movedBetweenBudgets ? 'create' : 'update', linkedItem);
        await mutate('budget', 'update', { id: activeBudgetId, source: 'transaction' });
      }

      toastSuccess('Transaction updated successfully');

      router.push(`/(drawer)/friend/${transaction.friendId}`);
    } catch (error: any) {
      const message = error?.message;
      if (
        message === 'Invalid amount' ||
        message === 'Budget not found' ||
        message === 'Failed to update budget'
      ) {
        toastError(message);
      } else {
        toastError('Failed to save transaction');
      }
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
