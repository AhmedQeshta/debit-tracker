import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { useToast } from '@/hooks/useToast';
import { generateId } from '@/lib/utils';
import { useBudgetStore } from '@/store/budgetStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useTransactionsStore } from '@/store/transactionsStore';
import { Transaction } from '@/types/models';
import { ITransactionFormData } from '@/types/transaction';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

export const useTransactionForm = () => {
  const { friendId: initialFriendId } = useLocalSearchParams<{ friendId: string }>();
  const friends = useFriendsStore(useShallow((state) => state.friends));
  const budgets = useBudgetStore(
    useShallow((state) =>
      state.budgets.filter((budget) => !budget.deletedAt && !budget.archivedAt),
    ),
  );
  const { budgets: allBudgets, getRemainingBudget, upsertItemFromTransaction } = useBudgetStore();
  const { addTransaction: addTransactionToStore } = useTransactionsStore();
  const { mutate } = useSyncMutation();
  const { toastError, toastSuccess } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ITransactionFormData>({
    defaultValues: {
      friendId: initialFriendId || '',
      budgetId: '',
      amount: '',
      title: '',
      date: Date.now(),
      note: '',
      isNegative: true,
    },
  });

  const isNegative = watch('isNegative');
  const friendId = watch('friendId');
  const budgetId = watch('budgetId');
  const selectedFriend = friends.find((f) => f.id === friendId);
  const selectedBudget = budgets.find((budget) => budget.id === budgetId);

  const addTransaction = async (params: {
    friendId: string;
    amount: number;
    budgetId?: string | null;
    sign: 1 | -1;
    title?: string;
    occurredAt?: string;
  }): Promise<{ transactionId: string; budgetId?: string | null }> => {
    const { friendId, amount, budgetId, sign, title, occurredAt } = params;

    // Amount normalization rule:
    // always start from an absolute magnitude so budget impact is deterministic.
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }

    const absAmount = Math.abs(amount);
    // Sign contract for transactions:
    // sign = 1  -> "+"
    // sign = -1 -> "-"
    const signedAmount = sign === -1 ? -absAmount : absAmount;

    const normalizedBudgetId = budgetId ?? null;

    if (normalizedBudgetId) {
      const budgetExists = allBudgets.some(
        (budget) => budget.id === normalizedBudgetId && !budget.deletedAt && !budget.archivedAt,
      );
      if (!budgetExists) {
        throw new Error('Budget not found');
      }
    }

    const occurredTimestamp = occurredAt ? Date.parse(occurredAt) : Date.now();
    const safeOccurredAt = Number.isFinite(occurredTimestamp) ? occurredTimestamp : Date.now();

    const now = Date.now();
    const transactionId = generateId();
    const transactionTitle = title?.trim() || 'Transaction';

    const newTransaction: Transaction = {
      id: transactionId,
      friendId,
      budgetId: normalizedBudgetId || undefined,
      title: transactionTitle,
      amount: signedAmount,
      sign,
      date: safeOccurredAt,
      note: '',
      createdAt: now,
      synced: false,
    };

    try {
      addTransactionToStore(newTransaction);

      // Sync order is intentional for offline safety:
      // 1) transaction create, 2) budget_item upsert, 3) budget totals recompute.
      await mutate('transaction', 'create', newTransaction);
    } catch {
      throw new Error('Failed to save transaction');
    }

    if (!normalizedBudgetId) {
      return { transactionId, budgetId: null };
    }

    let budgetLinkError = false;
    try {
      const linkedItem = upsertItemFromTransaction(newTransaction, normalizedBudgetId);
      if (!linkedItem) {
        throw new Error('Failed to update budget');
      }

      await mutate('budget_item', 'create', linkedItem);
      await mutate('budget', 'update', { id: normalizedBudgetId, source: 'transaction' });

      return { transactionId, budgetId: normalizedBudgetId };
    } catch {
      budgetLinkError = true;
      throw new Error('Failed to update budget');
    } finally {
      // Keep local transaction and mark pending sync on linkage failure.
      if (budgetLinkError) {
        await mutate('budget', 'update', { id: normalizedBudgetId, source: 'pending_retry' });
      }
    }
  };

  const onSubmit = async (data: ITransactionFormData) => {
    const amountNum = parseFloat(data.amount);

    setLoading(true);
    try {
      await addTransaction({
        friendId: data.friendId,
        amount: amountNum,
        budgetId: data.budgetId || null,
        sign: data.isNegative ? -1 : 1,
        title: data.title,
        occurredAt: new Date(data.date).toISOString(),
      });

      toastSuccess('Transaction added successfully');

      router.push(`/(drawer)/friend/${data.friendId}`);
    } catch (error: any) {
      const message = error?.message || 'Failed to save transaction';
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    friends,
    control,
    errors,
    handleSubmit: handleSubmit(onSubmit),
    isNegative,
    setIsNegative: (val: boolean) => setValue('isNegative', val),
    friendId,
    setFriendId: (val: string) => setValue('friendId', val),
    budgetId,
    setBudgetId: (val: string) => setValue('budgetId', val),
    budgets,
    selectedBudget,
    getRemainingBudget,
    selectedFriend,
    setValue,
    loading,
  };
};
