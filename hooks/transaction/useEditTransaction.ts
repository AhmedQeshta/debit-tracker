import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useSyncStore } from '@/store/syncStore';
import { generateId, safeId } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { IEditTransactionFormData } from '@/types/transaction';

export const useEditTransaction = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = safeId(id);
  const router = useRouter();
  const { transactions, updateTransaction } = useTransactionsStore();
  const { addToQueue } = useSyncStore();
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

  useEffect(() => {
    if (transaction) {
      reset({
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.title,
      });
    }
  }, [transaction, reset]);

  const onSubmit = async (data: IEditTransactionFormData) => {
    if (!transaction) return;

    setLoading(true);
    try {
      const isNegative = transaction.amount < 0;
      const amountNum = parseFloat(data.amount);
      const finalAmount = isNegative ? -Math.abs(amountNum) : Math.abs(amountNum);

      const updatedTransaction = {
        ...transaction,
        amount: finalAmount,
        title: data.description,
        synced: false,
      };

      updateTransaction(updatedTransaction);
      addToQueue({
        id: generateId(),
        type: 'transaction',
        action: 'update',
        payload: updatedTransaction,
      });

      router.back();
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
    router,
  };
};
