import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useBudgetStore } from '@/store/budgetStore';
import { generateId } from '@/lib/utils';
import { useSyncStore } from '@/store/syncStore';
import { useForm } from 'react-hook-form';
import { IBudgetFormData } from '@/types/budget';



export const useBudgetCreate = () => {
  const router = useRouter();
  const { addBudget } = useBudgetStore();
  const { addToQueue } = useSyncStore();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IBudgetFormData>({
    defaultValues: {
      title: '',
      currency: '$',
      totalBudget: '',
    },
  });

  const title = watch('title');
  const currency = watch('currency');
  const totalBudget = watch('totalBudget');

  const onSubmit = async (data: IBudgetFormData) => {
    setLoading(true);
    try {
      const amount = parseFloat(data.totalBudget);
      const budgetId = addBudget(data.title.trim(), data.currency, amount, undefined as any);
      const newBudget = {
        id: budgetId,
        title: data.title,
        currency: data.currency,
        totalBudget: amount,
        spentAmount: 0,
        createdAt: Date.now(),
        synced: false,
      };

      addToQueue({
        id: generateId(),
        type: 'budget',
        action: 'create',
        payload: newBudget,
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
    title,
    currency,
    totalBudget,
    setCurrency: (val: string) => setValue('currency', val),
    loading,
    router,
  };
};
