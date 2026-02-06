import { useToast } from '@/contexts/ToastContext';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';
import { generateId, getFinalAmount } from '@/lib/utils';
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
  const { addTransaction } = useTransactionsStore();
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
      amount: '',
      title: '',
      category: 'General',
      date: Date.now(),
      note: '',
      isNegative: true,
    },
  });

  const isNegative = watch('isNegative');
  const friendId = watch('friendId');
  const selectedFriend = friends.find((f) => f.id === friendId);

  const onSubmit = async (data: ITransactionFormData) => {
    const amountNum = parseFloat(data.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toastError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const finalAmount = getFinalAmount(data.amount);
      const newTransaction: Transaction = {
        id: generateId(),
        friendId: data.friendId,
        title: data.title,
        amount: finalAmount,
        sign: data.isNegative ? -1 : 1, // 1 = add debt (negative amount), -1 = reduce debt (positive amount)
        category: data.category,
        date: data.date,
        note: data.note,
        createdAt: Date.now(),
        synced: false,
      };
      addTransaction(newTransaction);
      await mutate('transaction', 'create', newTransaction);
      toastSuccess('Transaction added successfully');

      router.push(`/(drawer)/friend/${data.friendId}`);
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
    selectedFriend,
    setValue,
    loading,
  };
};
