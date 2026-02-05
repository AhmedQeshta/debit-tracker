import { useToast } from '@/contexts/ToastContext';
import { useCloudSync } from '@/hooks/sync/useCloudSync';
import { safeId } from '@/lib/utils';
import { useTransactionsStore } from '@/store/transactionsStore';
import { IEditTransactionFormData } from '@/types/transaction';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export const useEditTransaction = () =>
{
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = safeId(id);
  const router = useRouter();
  const { transactions, updateTransaction } = useTransactionsStore();
  const { syncNow } = useCloudSync();
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
    },
  });

  useEffect(() =>
  {
    if (transaction)
    {
      reset({
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.title,
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (data: IEditTransactionFormData) =>
  {
    if (!transaction) return;

    setLoading(true);
    try
    {
      const isNegative = transaction.amount < 0;
      const amountNum = parseFloat(data.amount);
      const finalAmount = isNegative ? -Math.abs(amountNum) : Math.abs(amountNum);

      const updatedTransaction = {
        ...transaction,
        amount: finalAmount,
        title: data.description,
        synced: false,
        updatedAt: Date.now(),
      };

      updateTransaction(updatedTransaction);

      // Trigger sync to push edit to Supabase
      try
      {
        await syncNow();
        toastSuccess('Transaction updated successfully');
      }
      catch (error)
      {
        console.error('[Sync] Failed to sync after edit:', error);
        toastSuccess('Transaction updated locally');
      }

      router.push(`/(drawer)/friend/${transaction.friendId}`);
    } finally
    {
      setLoading(false);
    }
  };

  return {
    control,
    errors,
    handleSubmit: handleSubmit(onSubmit),
    transaction,
    loading,
    router,
  };
};
