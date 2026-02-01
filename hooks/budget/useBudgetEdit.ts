import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBudgetStore } from '@/store/budgetStore';
import { safeId } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { IBudgetFormData } from '@/types/budget';
import { useSyncMutation } from '@/hooks/sync/useSyncMutation';

export const useBudgetEdit = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const budgetId = safeId(id);
  const router = useRouter();
  const { budgets, updateBudget } = useBudgetStore();
  const { mutate } = useSyncMutation();
  const [loading, setLoading] = useState(false);

  const budget = budgets.find((b) => b.id === budgetId);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IBudgetFormData>({
    defaultValues: {
      title: '',
      currency: '$',
      totalBudget: '',
    },
  });

  useEffect(() => {
    if (budget) {
      reset({
        title: budget.title,
        currency: budget.currency || '$',
        totalBudget: budget.totalBudget.toString(),
      });
    }
  }, [budget, reset]);

  const title = watch('title');
  const currency = watch('currency');
  const totalBudget = watch('totalBudget');

  const onSubmit = async (data: IBudgetFormData) => {
    if (!budget) return;

    setLoading(true);
    try {
      const amount = parseFloat(data.totalBudget);
      updateBudget(budgetId, {
        title: data.title.trim(),
        currency: data.currency,
        totalBudget: amount,
      });

      const updatedBudget = {
        ...budget,
        title: data.title,
        currency: data.currency,
        totalBudget: amount,
        synced: false,
      };

      await mutate('budget', 'update', updatedBudget);

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
    budget,
    loading,
    router,
  };
};
