import { showError } from '@/lib/alert';
import { generateId, getFinalAmount } from '@/lib/utils';
import { useTransactionsStore } from '@/store/transactionsStore';
import { useFriendsStore } from '@/store/friendsStore';
import { useSyncStore } from '@/store/syncStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useForm } from 'react-hook-form';
import { Transaction } from '@/types/models';

export interface ITransactionFormData {
  friendId: string;
  amount: string;
  title: string;
  category: string;
  date: number;
  note?: string;
  isNegative: boolean;
}

export const useTransactionForm = () => {
  const { friendId: initialFriendId } = useLocalSearchParams<{ friendId: string }>();
  const friends = useFriendsStore(useShallow((state) => state.friends));
  const { addTransaction } = useTransactionsStore();
  const { addToQueue } = useSyncStore();
  const router = useRouter();

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

  const onSubmit = (data: ITransactionFormData) => {
    const amountNum = parseFloat(data.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showError('Error', 'Please enter a valid amount');
      return;
    }

    const newTransaction: Transaction = {
      id: generateId(),
      friendId: data.friendId,
      title: data.title,
      amount: getFinalAmount(data.amount, data.isNegative),
      category: data.category,
      date: data.date,
      note: data.note,
      createdAt: Date.now(),
      synced: false,
    };

    addTransaction(newTransaction);
    addToQueue({
      id: generateId(),
      type: 'transaction',
      action: 'create',
      payload: newTransaction,
    });

    router.back();
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
  };
};
